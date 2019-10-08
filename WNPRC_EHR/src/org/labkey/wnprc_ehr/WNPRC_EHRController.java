/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.wnprc_ehr;

import au.com.bytecode.opencsv.CSVWriter;
import com.google.common.base.MoreObjects;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.ApiUsageException;
import org.labkey.api.action.ExportAction;
import org.labkey.api.action.RedirectAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRDemographicsService;
import org.labkey.api.ehr.demographics.AnimalRecord;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.resource.FileResource;
import org.labkey.api.resource.MergedDirectoryResource;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.CSRF;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.security.RequiresNoPermission;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.RequiresSiteAdmin;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.ResultSetUtil;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.NotFoundException;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.googledrive.api.DriveSharePermission;
import org.labkey.googledrive.api.DriveWrapper;
import org.labkey.googledrive.api.FolderWrapper;
import org.labkey.googledrive.api.GoogleDriveService;
import org.labkey.webutils.api.action.SimpleJspPageAction;
import org.labkey.webutils.api.action.SimpleJspReportAction;
import org.labkey.webutils.api.json.EnhancedJsonResponse;
import org.labkey.webutils.api.json.JsonUtils;
import org.labkey.wnprc_ehr.bc.BCReportManager;
import org.labkey.wnprc_ehr.bc.BCReportRunner;
import org.labkey.wnprc_ehr.bc.BusinessContinuityReport;
import org.labkey.wnprc_ehr.calendar.Calendar;
import org.labkey.wnprc_ehr.calendar.GoogleCalendar;
import org.labkey.wnprc_ehr.calendar.Office365Calendar;
import org.labkey.wnprc_ehr.data.ColonyCensus.AssignmentPerDiems;
import org.labkey.wnprc_ehr.data.ColonyCensus.ColonyCensus;
import org.labkey.wnprc_ehr.data.ColonyCensus.PopulationChangeEvent;
import org.labkey.wnprc_ehr.data.ColonyCensus.PopulationInstant;
import org.labkey.wnprc_ehr.data.ColonyCensus.PopulationsOverTime;
import org.labkey.wnprc_ehr.dataentry.validators.AnimalVerifier;
import org.labkey.wnprc_ehr.dataentry.validators.ProjectVerifier;
import org.labkey.wnprc_ehr.dataentry.validators.exception.InvalidAnimalIdException;
import org.labkey.wnprc_ehr.dataentry.validators.exception.InvalidProjectException;
import org.labkey.wnprc_ehr.email.EmailServer;
import org.labkey.wnprc_ehr.email.EmailServerConfig;
import org.labkey.wnprc_ehr.email.MessageIdentifier;
import org.labkey.wnprc_ehr.schemas.WNPRC_Schema;
import org.labkey.wnprc_ehr.service.dataentry.BehaviorDataEntryService;
import org.springframework.validation.BindException;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * User: bbimber
 * Date: 5/16/12
 * Time: 1:56 PM
 */
public class WNPRC_EHRController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_EHRController.class);

    public WNPRC_EHRController()
    {
        setActionResolver(_actionResolver);
    }

    WNPRC_EHRModule getModule()
    {
        Module module = ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);
        WNPRC_EHRModule wnprc_ehrModule = (WNPRC_EHRModule) module;
        return wnprc_ehrModule;
    }

    MergedDirectoryResource getModuleDataDir(String subdirectory)
    {
        Resource r = getModule().getModuleResource("data/" + subdirectory);
        MergedDirectoryResource dir = ((MergedDirectoryResource) r);

        if ((dir == null) || dir.isFile() || !dir.exists())
        {
            return null;
        }
        else
        {
            return dir;
        }
    }

    EnhancedJsonResponse getEnhancedJsonResponse()
    {
        return new EnhancedJsonResponse();
    }

    public static class PopulationEventsOverPeriodForm
    {
        private Date _startdate;
        private Date _enddate;
        private String _species;

        public Date getStartdate()
        {
            return _startdate;
        }

        public void setStartdate(Date date)
        {
            _startdate = date;
        }

        public Date getEnddate()
        {
            return _enddate;
        }

        public void setEnddate(Date enddate)
        {
            _enddate = enddate;
        }

        public String getSpecies()
        {
            return _species;
        }

        public void setSpecies(String species)
        {
            _species = species;
        }

        public PopulationChangeEvent.Species getSpeciesEnum()
        {
            return PopulationChangeEvent.Species.getFromString(getSpecies());
        }
    }

    public static class GetAnimalDemographicsForRoomForm
    {
        private String _room;

        public String getRoom()
        {
            return _room;
        }

        public void setRoom(String room)
        {
            _room = room;
        }
    }

    public static class BillablePerDiemsForm
    {
        private String startDate;
        private String endDate;

        public LocalDate getStartDate()
        {
            if (startDate == null)
            {
                LocalDate lastMonthToday = (new LocalDate()).minusMonths(1);
                return lastMonthToday.withDayOfMonth(1);
            }
            else
            {
                return new LocalDate(startDate);
            }
        }

        public void setStartDate(String startDate)
        {
            this.startDate = startDate;
        }

        public LocalDate getEndDate()
        {
            if (endDate == null)
            {
                LocalDate lastMonthToday = (new LocalDate()).minusMonths(1);
                return lastMonthToday.dayOfMonth().withMaximumValue();
            }
            else
            {
                return new LocalDate(endDate);
            }
        }

        public void setEndDate(String endDate)
        {
            this.endDate = endDate;
        }
    }

    public static class EmailForm
    {
        private String _name;

        public String getName()
        {
            return _name;
        }

        public void setName(String name)
        {
            _name = name;
        }
    }

    public static class EmailServerForm
    {
        private String id;
        private String _username;
        private String _password;

        public String getId()
        {
            return id;
        }

        public void setId(String id)
        {
            this.id = id;
        }

        public String getUsername()
        {
            return _username;
        }

        public void setUsername(String username)
        {
            _username = username;
        }

        public String getPassword()
        {
            return _password;
        }

        public void setPassword(String password)
        {
            _password = password;
        }

        public EmailServer getEmailServer(User user, Container container) throws Exception
        {
            if ((id != null) && (_password != null) && (_username != null))
            {
                EmailServerConfig config = EmailServerConfig.load(user, container, getId());
                return new EmailServer(config, getUsername(), getPassword());
            }
            else
            {
                throw new ApiUsageException("You must supply a server, username and password.");
            }
        }
    }

    public static class VirologyResultsForm extends EmailServerForm
    {
        private String _subject;
        private String _date;
        private String _fromList;

        public String getSubject()
        {
            if (_subject == null)
            {
                throw new ApiUsageException("You must supply a subject line in the 'subject' parameter.");
            }
            return _subject;
        }

        public void setSubject(String subject)
        {
            _subject = subject;
        }

        public String getDate()
        {
            return _date;
        }

        public void setDate(String date)
        {
            _date = date;
        }

        public String getFromList()
        {
            return _fromList;
        }

        public void setFromList(String fromList)
        {
            _fromList = fromList;
        }

        public Date getSentDate()
        {
            DateFormat df = new SimpleDateFormat("yyyy/MM/dd kk:mm:ss", Locale.ENGLISH);
            Date result;
            try
            {
                result = df.parse(_date);
            }
            catch (ParseException e)
            {
                throw new ApiUsageException("You must supply a valid sent timestamp in the form YYYY/MM/DD HH:mm:ss as the 'date' parameter.");
            }
            return result;
        }

        public String[] getFromListAsArray()
        {
            if (_fromList != null)
            {
                return StringUtils.split(_fromList, ",");
            }
            else
            {
                return new String[0];
            }
        }

        public MessageIdentifier getMessageIdentifier()
        {
            return new MessageIdentifier(getSubject(), getFromListAsArray(), getSentDate());
        }
    }

    public static class AssignmentBaseForm
    {
        private String _animalId;
        private String _project;

        public String getAnimalId()
        {
            return _animalId;
        }

        public void setAnimalId(String animalId)
        {
            _animalId = animalId;
        }

        public String getProject()
        {
            return _project;
        }

        public void setProject(String project)
        {
            _project = project;
        }
    }

    public static class AddBehaviorAssignmentForm extends AssignmentBaseForm
    {
        private Date _assignDate;
        private Date _estimatedReleaseDate;
        private String _remark;

        public Date getAssignDate()
        {
            return _assignDate;
        }

        public void setAssignDate(Date assignDate)
        {
            _assignDate = assignDate;
        }

        public Date getEstimatedReleaseDate()
        {
            return _estimatedReleaseDate;
        }

        public void setEstimatedReleaseDate(Date estimatedReleaseDate)
        {
            _estimatedReleaseDate = estimatedReleaseDate;
        }

        public String getRemark()
        {
            return _remark;
        }

        public void setRemark(String remark)
        {
            _remark = remark;
        }
    }

    public static class ReleaseAnimalFromBehaviorAssignmentForm extends AssignmentBaseForm
    {
        private Date _releaseDate;

        public Date getReleaseDate()
        {
            return _releaseDate;
        }

        public void setReleaseDate(Date releaseDate)
        {
            _releaseDate = releaseDate;
        }
    }

    @RequiresLogin
    public static class ReleaseAnimalFromBehaviorAssignmentAction extends ApiAction<ReleaseAnimalFromBehaviorAssignmentForm>
    {

        @Override
        public Object execute(ReleaseAnimalFromBehaviorAssignmentForm form, BindException errors) throws Exception
        {
            BehaviorDataEntryService.get(getUser(), getContainer()).releaseAnimalFromBehaviorProject(
                    form.getAnimalId(),
                    form.getProject(),
                    form.getReleaseDate()
            );

            return null;
        }
    }

    public static class ValidateAnimalIdForm
    {
        public boolean isAliveAndAtCenter = false;
        private String animalid;

        public String getAnimalid()
        {
            return animalid;
        }

        public void setAnimalid(String animalid)
        {
            this.animalid = animalid;
        }

        public void setIsAliveAndAtCenter(boolean checkAlive)
        {
            this.isAliveAndAtCenter = checkAlive;
        }
    }

    @RequiresLogin
    public static class ValidateAnimalIdAction extends ApiAction<ValidateAnimalIdForm>
    {
        @Override
        public Object execute(ValidateAnimalIdForm form, BindException errors)
        {
            JSONObject returnJSON = new JSONObject();
            boolean isValid = true;
            String reason = "";

            try
            {
                AnimalVerifier av = new AnimalVerifier(form.getAnimalid(), getUser(), getContainer());
                av.exists();

                if (form.isAliveAndAtCenter)
                {
                    av.isAliveAndAtCenter();
                }
            }
            catch (InvalidAnimalIdException e)
            {
                isValid = false;
                reason = e.getMessage();
            }

            returnJSON.put("isValid", isValid);
            returnJSON.put("reason", reason);

            return returnJSON;
        }
    }

    public static class CheckAnimalAssignment
    {
        private String animalid;
        private String projectid;
        private Date date;

        public String getAnimalid()
        {
            return animalid;
        }

        public void setAnimalid(String animalid)
        {
            this.animalid = animalid;
        }

        public String getProjectid()
        {
            return projectid;
        }

        public void setProjectid(String projectid)
        {
            this.projectid = projectid;
        }

        public Date getDate()
        {
            return date;
        }

        public void setDate(Date date)
        {
            this.date = date;
        }
    }

    @RequiresLogin
    @ActionNames("checkIfAnimalIsAssigned")
    public static class CheckIfAnimalIsAssigned extends ApiAction<CheckAnimalAssignment>
    {
        @Override
        public Object execute(CheckAnimalAssignment form, BindException errors)
        {
            JSONObject returnJSON = new JSONObject();
            boolean assigned = false;

            if (form.getDate() == null || form.getAnimalid() == null || form.getProjectid() == null)
            {
                throw new IllegalArgumentException("Date, animalid, and projectid are all required.");
            }

            try
            {
                ProjectVerifier pv = new ProjectVerifier(form.getProjectid(), getUser(), getContainer());

                // Throws an error if the animal is assigned
                pv.animalIsNotAssignedOn(form.getAnimalid(), form.getDate());

            }
            catch (InvalidProjectException e)
            {
                assigned = true;
            }

            returnJSON.put("assigned", assigned);

            return returnJSON;
        }
    }

    public static class UserForm
    {
        public String username;

        public String getUsername()
        {
            return username;
        }

        public void setUsername(String username)
        {
            this.username = username;
        }
    }

    @RequiresPermission(ReadPermission.class)
    @ActionNames("getChanges")
    @CSRF
    public class GetChangeLists extends ApiAction<Void>
    {
        public ApiResponse execute(Void form, BindException errors) throws Exception
        {
            Map<String, Object> props = new HashMap<>();

            // Grab the changelists directory
            MergedDirectoryResource changelistDir = getModuleDataDir("changelists");

            for (Resource resource : changelistDir.list())
            {
                if (resource.isFile())
                { // Don't traverse subdirectories.
                    File changelistFile = ((FileResource) resource).getFile();
                    String filename = changelistFile.getAbsolutePath();
                    String text = "";
                    String errorText = "";

                    if (changelistFile.canRead())
                    {
                        BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(changelistFile.getAbsolutePath()), "UTF-8"));

                        String line = null;
                        while ((line = reader.readLine()) != null)
                        {
                            text += '\n' + line;
                        }
                        reader.close();
                    }

                    HashMap<String, String> fileInfo = new HashMap<>();
                    fileInfo.put("text", text);
                    fileInfo.put("errorText", errorText);
                    props.put(filename, fileInfo);
                }
            }

            return new ApiSimpleResponse(props);
        }
    }

    @RequiresPermission(ReadPermission.class)
    @RequiresLogin
    @ActionNames("getColonyPopulationPerMonth")
    public class GetPopulationPerMonth extends ApiAction<Void>
    {
        public ApiResponse execute(Void form, BindException errors)
        {
            ColonyCensus colonyCensus = new ColonyCensus(getContainer(), getUser());
            Map<String, Map<LocalDate, PopulationInstant>> populations = colonyCensus.getPopulationsPerMonthForAllSpecies();

            Map<String, Object> props = new HashMap<>();
            props.put("populations", populations);

            return new ApiSimpleResponse(props);
        }
    }

    @RequiresLogin
    @ActionNames("getPopulationChangeEventsOverPeriod")
    public class GetPopulationEventsOverPeriod extends ApiAction<PopulationEventsOverPeriodForm>
    {
        public ApiResponse execute(PopulationEventsOverPeriodForm form, BindException errors)
        {
            DateTime start = new DateTime(form.getStartdate());
            DateTime end = new DateTime(form.getEnddate());

            ColonyCensus colonyCensus = new ColonyCensus(getContainer(), getUser());
            PopulationsOverTime pops = new PopulationsOverTime(start, end, colonyCensus, form.getSpeciesEnum());

            EnhancedJsonResponse json = getEnhancedJsonResponse();
            json.put("pops", pops);

            return json;
        }
    }

    @RequiresPermission(ReadPermission.class)
    @CSRF
    public class GetAnimalDemographicsForRoomAction extends ApiAction<GetAnimalDemographicsForRoomForm>
    {
        public ApiResponse execute(GetAnimalDemographicsForRoomForm form, BindException errors)
        {
            Map<String, Object> props = new HashMap<>();

            if (form.getRoom() == null)
            {
                errors.reject(ERROR_MSG, "No Room Specified");
                return null;
            }

            Results rs = null;
            List<String> animalIds = new ArrayList<String>();

            try
            {
                // Set up our query
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("room"), form.getRoom());
                QueryHelper animalListQuery = new QueryHelper(getContainer(), getUser(), "study", "demographicsCurLocation");

                // Define columns to get
                List<FieldKey> columns = new ArrayList<FieldKey>();
                columns.add(FieldKey.fromString("room"));
                columns.add(FieldKey.fromString("Id"));

                // Execute the query
                rs = animalListQuery.select(columns, filter);

                // Now, execute it to get our list of Ids
                if (rs.next())
                {
                    do
                    {
                        animalIds.add(rs.getString(FieldKey.fromString("Id")));
                    }
                    while (rs.next());
                }

                try
                {
                    JSONObject json = new JSONObject();
                    for (AnimalRecord r : EHRDemographicsService.get().getAnimals(getContainer(), animalIds))
                    {
                        json.put(r.getId(), r.getProps());
                    }

                    props.put("results", json);
                }
                catch (Exception e)
                {
                    ExceptionUtil.logExceptionToMothership(getViewContext().getRequest(), e);
                }
            }
            catch (SQLException e)
            {
                throw new RuntimeSQLException(e);
            }
            finally
            {
                ResultSetUtil.close(rs);
            }

            return new ApiSimpleResponse(props);
        }
    }

    @RequiresLogin()
    @ActionNames("billablePerDiems")
    public class BillablePerDiemsAction extends ApiAction<BillablePerDiemsForm>
    {
        @Override
        public Object execute(BillablePerDiemsForm form, BindException errors)
        {
            AssignmentPerDiems assignmentPerDiems = new AssignmentPerDiems(getContainer(), getUser(), form.getStartDate(), form.getEndDate());

            return new EnhancedJsonResponse(assignmentPerDiems.getBillableDaysJSON());
        }
    }

    @RequiresLogin()
    @ActionNames("billablePerDiemsAsCSV")
    public class BillablePerDiemsAsCSV extends ExportAction<BillablePerDiemsForm>
    {
        @Override
        public void export(BillablePerDiemsForm form, HttpServletResponse response, BindException errors) throws Exception
        {
            AssignmentPerDiems assignmentPerDiems = new AssignmentPerDiems(getContainer(), getUser(), form.getStartDate(), form.getEndDate());
            List<AssignmentPerDiems.BillableDay> billableDays = AssignmentPerDiems.consolidateBillableDays(assignmentPerDiems.getBillableDays());

            // Prevent caching of the file.
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
            response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
            response.setHeader("Expires", "0"); // Proxies.

            if (billableDays.size() == 0)
            {
                response.setContentType("text/plain");
                setFilename(response, "billablePerDiems.txt");

                ServletOutputStream out = response.getOutputStream();

                out.println("There are no billable per-diem assignments for the time range of " + form.getStartDate().toString() + " to " + form.getEndDate().toString() + ".");


                // Close up the pipeline
                out.flush();
                out.close();
            }
            else
            {
                response.setContentType("text/csv");
                String filename = "billablePerDiems_" + form.getStartDate().toString() + "_" + form.getEndDate().toString() + ".csv";
                setFilename(response, filename);

                Boolean headerHasBeenPrinted = false;
                CSVWriter csvOut = new CSVWriter(response.getWriter());

                for (AssignmentPerDiems.BillableDay billableDay : billableDays)
                {
                    if (!headerHasBeenPrinted)
                    {
                        csvOut.writeNext(billableDay.csvHeaderLine);
                        headerHasBeenPrinted = true;
                    }

                    csvOut.writeNext(billableDay.toCsvLine());
                }

                csvOut.flush();
                csvOut.close();
            }
        }

        private void setFilename(HttpServletResponse response, String filename)
        {
            // Set the filename in the header.
            String headerKey = "Content-Disposition";
            String headerValue = String.format("attachment; filename=\"%s\"", filename);
            response.setHeader(headerKey, headerValue);
        }
    }

    public class EmailModel
    {
        public HashMap<String, Map<String, String>> data = new HashMap<>();

        public String getName()
        {
            return "Jon";
        }

        public java.lang.Void add(String area, String room, String ob)
        {
            Map areaMap = data.get(area);
            if (areaMap == null)
            {
                areaMap = new HashMap<>();
                data.put(area, areaMap);
            }

            areaMap.put(room, ob);
            return null;
        }

        public java.lang.Void populateData()
        {
            this.add("a", "a142", "r12900");
            this.add("a", "a142", "r12905");
            this.add("a", "a144", "r12904");
            this.add("b", "b12", "r12903");
            return null;
        }
    }

    @RequiresNoPermission()
    public class ExampleEmailAction extends ApiAction<EmailForm>
    {
        @Override
        public ApiResponse execute(EmailForm form, BindException errors) throws Exception
        {
            EmailModel model = new EmailModel();
            model.populateData();
            String name = form.getName();
            if (name == null)
            {
                throw new Exception("You must supply a JSP template name.");
            }
            WNPRC_EHREmail<EmailModel> email = new WNPRC_EHREmail<>(form.getName());
            String emailContents = email.renderEmail(model);

            HashMap<String, String> props = new HashMap<>();
            props.put("text", emailContents);

            return new ApiSimpleResponse(props);
        }
    }

    @ActionNames("listEmails")
    @RequiresNoPermission()
    public class ListEmailsAction extends ApiAction<EmailServerForm>
    {
        @Override
        public ApiResponse execute(EmailServerForm form, BindException errors) throws Exception
        {
            return new ApiSimpleResponse(form.getEmailServer(getUser(), getContainer()).getInboxMessages());
        }
    }

    @ActionNames("getVirologyResultsFromEmail")
    @RequiresNoPermission()
    public class GetVirologyResultsFromEmailAction extends ApiAction<VirologyResultsForm>
    {
        @Override
        public ApiResponse execute(VirologyResultsForm form, BindException errors) throws Exception
        {
            JSONObject json = new JSONObject();

            JSONArray rows = form.getEmailServer(getUser(), getContainer()).getExcelDataFromMessage(form.getMessageIdentifier());
            json.put("rows", rows);

            return new ApiSimpleResponse(json);
        }
    }

    @ActionNames("deleteEmail")
    @RequiresNoPermission()
    public class deleteEmailAction extends ApiAction<VirologyResultsForm>
    {
        @Override
        public ApiResponse execute(VirologyResultsForm form, BindException errors) throws Exception
        {
            JSONObject json = new JSONObject();

            form.getEmailServer(getUser(), getContainer()).deleteMessage(form.getMessageIdentifier());

            return new ApiSimpleResponse(json);
        }
    }

    @ActionNames("previewEmailExcelAttachment")
    @RequiresNoPermission()
    public class previewEmailAction extends ApiAction<VirologyResultsForm>
    {
        @Override
        public ApiResponse execute(VirologyResultsForm form, BindException errors) throws Exception
        {
            JSONObject json = new JSONObject();

            JSONArray rows = form.getEmailServer(getUser(), getContainer()).getExcelPreviewData(form.getMessageIdentifier());
            json.put("rows", rows);

            JSONObject email = form.getEmailServer(getUser(), getContainer()).getInboxMessage(form.getMessageIdentifier());
            json.put("emaildata", email);

            WNPRC_EHREmail<JSONObject> tablePreview = new WNPRC_EHREmail<>("/org/labkey/wnprc_ehr/email/ExcelPreview.jsp");

            json.put("html", tablePreview.renderEmail(json));
            return new ApiSimpleResponse(json);
        }
    }

    public abstract class WNPRCJspPageAction extends SimpleJspPageAction
    {
        @Override
        public Module getModule()
        {
            return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);
        }
    }

    public abstract class WNPRCReportPageAction extends SimpleJspReportAction
    {
        @Override
        public Module getModule()
        {
            return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);
        }
    }

    @ActionNames("NecropsySchedule")
    @RequiresLogin()
    public class NecropsyScheduleAction extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/dataentry/NecropsySchedule.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Necropsy Schedule";
        }
    }

    @ActionNames("SurgeryProcedureSchedule")
    @RequiresLogin()
    public class SurgeryProcedureScheduleAction extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/dataentry/SurgeryProcedureSchedule.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Surgery/Procedure Schedule";
        }
    }

    public static class SurgeryProcedureEvent
    {
        private String requestId;
        private Date start;
        private Date end;
        private String room;
        private String subject;
        private List<String> categories;
        private String assignedTo;
        private String calendarId;

        public String getRequestId()
        {
            return requestId;
        }

        public Date getStart()
        {
            return start;
        }

        public Date getEnd()
        {
            return end;
        }

        public String getRoom()
        {
            return room;
        }

        public String getSubject()
        {
            return subject;
        }

        public List<String> getCategories() {
            return categories;
        }

        public String getAssignedTo()
        {
            return assignedTo;
        }

        public String getCalendarId() {
            return calendarId;
        }

        public void setRequestId(String requestid)
        {
            this.requestId = requestid;
        }

        public void setStart(Date start)
        {
            this.start = start;
        }

        public void setEnd(Date end)
        {
            this.end = end;
        }

        public void setRoom(String room)
        {
            this.room = room;
        }

        public void setSubject(String title)
        {
            this.subject = title;
        }

        public void setCategories(List<String> categories)
        {
            this.categories = categories;
        }

        public void setAssignedTo(String assignedTo)
        {
            this.assignedTo = assignedTo;
        }

        public void setCalendarId(String calendarId) {
            this.calendarId = calendarId;
        }
    }

    @ActionNames("ScheduleSurgeryProcedure")
    //TODO @RequiresPermission("SomeGroupPermissionSettingHere")
    @RequiresLogin()
    public class ScheduleSurgeryProcedureAction extends ApiAction<SurgeryProcedureEvent>
    {
        @Override
        public Object execute(SurgeryProcedureEvent event, BindException errors) throws Exception
        {
            List<Map<String, Object>> spRows = getSurgeryProcedureRecords(event.getRequestId());

            JSONObject response = new JSONObject();
            response.put("success", false);
            Office365Calendar calendar = new Office365Calendar();
            calendar.setUser(getUser());
            calendar.setContainer(getContainer());
            String apptId = calendar.addEvent(event.getStart(), event.getEnd(), event.getRoom(), event.getSubject(), event.getRequestId(), event.getCategories(), event.getCalendarId());

            if (apptId != null)
            {
                try (DbScope.Transaction transaction = WNPRC_Schema.getWnprcDbSchema().getScope().ensureTransaction()) {
                    /**
                     * Insert the necessary records into the ehr.tasks table
                     */
                    //TODO get other info from jsp
                    for(Map<String, Object> spRow : spRows)
                    {
                        String taskId = UUID.randomUUID().toString();
                        spRow.put("taskid", taskId);
                        JSONObject taskRecord = new JSONObject();
                        taskRecord.put("taskid", taskId);
                        taskRecord.put("title", "SurgeryProcedure");
                        taskRecord.put("category", "task");
                        taskRecord.put("assignedto", event.getAssignedTo());
                        taskRecord.put("QCStateLabel", "Scheduled");
                        taskRecord.put("duedate", "");
                        taskRecord.put("formtype", "SurgeryProcedure");
                        insertRecord(taskRecord, "ehr", "tasks");
                    }

                    /**
                     * Update the surgery record(s) to contain the newly created taskid(s)
                     */
                    for(Map<String, Object> spRow : spRows)
                    {
                        //Initialize data to be updated and convert it to the necessary format
                        JSONObject surgeryRecord = new JSONObject();
                        surgeryRecord.put("objectid", spRow.get("objectid"));
                        surgeryRecord.put("apptid", apptId);
                        surgeryRecord.put("QCStateLabel", "Scheduled");
                        surgeryRecord.put("taskid", spRow.get("taskid"));
                        surgeryRecord.put("date", event.getStart());
                        surgeryRecord.put("enddate", event.getEnd());
                        updateRecord(surgeryRecord, "study", "surgery_procedure");
                    }

                    //TODO look into permissions stuff... ti.hasPermission(getUser(), DeletePermission.class);

                    //TODO add some logic to make sure rows were updated correctly

                    JSONObject requestRecord = new JSONObject();
                    requestRecord.put("requestid", event.getRequestId());
                    requestRecord.put("QCStateLabel", "Scheduled");
                    updateRecord(requestRecord, "ehr", "requests");

                    transaction.commit();
                    response.put("success", true);
                } catch (Exception e) {
                    calendar.cancelEvent(apptId);
                } finally {

                }
            }
            return response;
        }
    }

    public static class SurgeryProcedureChangeStatusEvent
    {
        private String requestid;
        private String taskid;
        private String qcstatelabel;
        private String statuschangereason;

        public String getRequestId()
        {
            return requestid;
        }

        public String getTaskId()
        {
            return taskid;
        }

        public String getQCStateLabel()
        {
            return qcstatelabel;
        }

        public String getStatusChangeReason()
        {
            return statuschangereason;
        }

        public void setRequestId(String requestid)
        {
            this.requestid = requestid;
        }

        public void setTaskId(String taskid)
        {
            this.taskid = taskid;
        }

        public void setQCStateLabel(String qcstatelabel)
        {
            this.qcstatelabel = qcstatelabel;
        }

        public void setStatusChangeReason(String statuschangereason)
        {
            this.statuschangereason = statuschangereason;
        }
    }

    @ActionNames("SurgeryProcedureChangeStatus")
    //TODO @RequiresPermission("SomeGroupPermissionSettingHere")
    @RequiresLogin()
    public class SurgeryProcedureChangeStatusAction extends ApiAction<SurgeryProcedureChangeStatusEvent>
    {
        @Override
        public Object execute(SurgeryProcedureChangeStatusEvent event, BindException errors) throws Exception
        {
            List<Map<String, Object>> spRows = getSurgeryProcedureRecords(event.getRequestId());

            JSONObject response = new JSONObject();
            response.put("success", false);

            try (DbScope.Transaction transaction = WNPRC_Schema.getWnprcDbSchema().getScope().ensureTransaction()) {
                /**
                 * Update surgery records
                 */
                for(Map<String, Object> spRow : spRows)
                {
                    //Initialize data to be updated and convert it to the necessary format
                    JSONObject surgeryRecord = new JSONObject();
                    surgeryRecord.put("objectid", spRow.get("objectid"));
                    surgeryRecord.put("QCStateLabel", event.getQCStateLabel());
                    surgeryRecord.put("statuschangereason", event.getStatusChangeReason());
                    updateRecord(surgeryRecord, "study", "surgery_procedure");
                }

                /**
                 * Update request record
                 */
                JSONObject requestRecord = new JSONObject();
                requestRecord.put("requestid", event.getRequestId());
                requestRecord.put("QCStateLabel", event.getQCStateLabel());
                requestRecord.put("remark", event.getStatusChangeReason());
                updateRecord(requestRecord, "ehr", "requests");

                /**
                 * Update task record
                 */
                JSONObject taskRecord = new JSONObject();
                taskRecord.put("taskid", event.getTaskId());
                taskRecord.put("QCStateLabel", event.getQCStateLabel());
                updateRecord(taskRecord, "ehr", "tasks");

                if ("Request: Pending".equals(event.getQCStateLabel()))
                {
                    String apptid = null;
                    if(spRows.size() > 0) {
                        apptid = (String) spRows.get(0).get("apptid");
                    }
                    Office365Calendar calendar = new Office365Calendar();
                    calendar.cancelEvent(apptid);
                }

                transaction.commit();
                response.put("success", true);
            } catch (Exception e) {
                int x = 3;
                //TODO nothing?
            } finally {

            }

            return response;
        }
    }

    private List<Map<String, Object>> getSurgeryProcedureRecords(String requestId) throws java.sql.SQLException
    {
        List<FieldKey> columns = new ArrayList<>();
        columns.add(FieldKey.fromString("objectid"));
        columns.add(FieldKey.fromString("apptid"));

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("requestid"), requestId);
        QueryHelper spQuery = new QueryHelper(getContainer(), getUser(), "study", "surgery_procedure");
        Results rs = spQuery.select(columns, filter);

        List<Map<String, Object>> spRows = new ArrayList<>();
        while (rs.next())
        {
            spRows.add(rs.getRowMap());
        }
        return spRows;
    }

    private void insertRecord(JSONObject record, String schema, String table) throws DuplicateKeyException, BatchValidationException, QueryUpdateServiceException, SQLException
    {
        List<Map<String, Object>> rowsToInsert  = SimpleQueryUpdater.makeRowsCaseInsensitive(record);

        TableInfo ti = QueryService.get().getUserSchema(getUser(), getContainer(), schema).getTable(table);
        QueryUpdateService service = ti.getUpdateService();

        BatchValidationException validationException = new BatchValidationException();
        List<Map<String, Object>> insertedRows = service.insertRows(getUser(), getContainer(), rowsToInsert, validationException, null, null);
        if (validationException.hasErrors())
        {
            throw validationException;
        }
    }

    private void updateRecord(JSONObject record, String schema, String table) throws InvalidKeyException, BatchValidationException, QueryUpdateServiceException, SQLException
    {
        List<Map<String, Object>> rowsToUpdate = SimpleQueryUpdater.makeRowsCaseInsensitive(record);

        //Get the service object based on schema/table
        TableInfo ti = QueryService.get().getUserSchema(getUser(), getContainer(), schema).getTable(table);
        QueryUpdateService service = ti.getUpdateService();

        List<Map<String, Object>> updatedRows = service.updateRows(getUser(), getContainer(), rowsToUpdate, rowsToUpdate, null, null);
        if (updatedRows.size() != rowsToUpdate.size()) {
            throw new QueryUpdateServiceException("Not all " + schema + "." + table + " rows updated properly");
        }
    }

    public static class FetchCalendarEvent
    {
        private String calendarId;

        public String getCalendarId()
        {
            return calendarId;
        }

        public void setCalendarId(String calendarId)
        {
            this.calendarId = calendarId;
        }
    }

    @ActionNames("FetchSurgeryProcedureOutlookEvents")
    //TODO @RequiresPermission("SomeGroupPermissionSettingHere")
    @RequiresLogin()
    public class FetchSurgeryProcedureOutlookEventsAction extends ApiAction<FetchCalendarEvent>
    {
        @Override
        public Object execute(FetchCalendarEvent event, BindException errors)
        {
            JSONObject response = new JSONObject();
            response.put("success", false);

            try
            {
                String office365EventsString = fetchCalendarEvents(new Office365Calendar(), event.getCalendarId());
                response.put("events", office365EventsString);
                if (office365EventsString != null && office365EventsString.trim().length() > 0)
                {
                    response.put("success", true);
                }
            }
            catch (Exception e)
            {
                //TODO add logging
                response.put("success", false);
            }

            return response;
        }
    }

    @ActionNames("FetchSurgeryProcedureGoogleEvents")
    //TODO @RequiresPermission("SomeGroupPermissionSettingHere")
    @RequiresLogin()
    public class FetchSurgeryProcedureGoogleEventsAction extends ApiAction<FetchCalendarEvent>
    {
        @Override
        public Object execute(FetchCalendarEvent event, BindException errors)
        {
            JSONObject response = new JSONObject();
            response.put("success", false);

            try
            {
                String googleEventsString = fetchCalendarEvents(new GoogleCalendar(), event.getCalendarId());
                response.put("events", googleEventsString);
                if (googleEventsString != null && googleEventsString.trim().length() > 0)
                {
                    response.put("success", true);
                }
            }
            catch (Exception e)
            {
                //TODO add logging
                response.put("success", false);
            }

            return response;
        }
    }

    private String fetchCalendarEvents(Calendar calendar, String calendarId) throws Exception
    {
        calendar.setUser(getUser());
        calendar.setContainer(getContainer());
        return calendar.getCalendarEventsAsJson(calendarId);
    }

    @ActionNames("PathologyCaseList")
    @RequiresLogin()
    public class PathologyCaseListAction extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/dataentry/PathologyCaseList.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Pathology Case List";
        }
    }

    @ActionNames("NecropsyReport")
    @RequiresLogin()
    public class NecropsyReportAction extends WNPRCReportPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/dataentry/NecropsyReport.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Necropsy Report";
        }
    }

    @ActionNames("NecropsyCollectionList")
    @RequiresLogin()
    public class NecropsyCollectionListAction extends WNPRCReportPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/dataentry/NecropsyCollectionList.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Necropsy Collection List";
        }
    }

    @ActionNames("ColonyCensus")
    @RequiresLogin()
    public class ColonyCensusAction extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/population_management/ColonyCensus.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Colony Census";
        }
    }

    @ActionNames("PerDiems")
    @RequiresLogin()
    public class PerDiemsAction extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/population_management/PerDiems.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Per Diems";
        }
    }

    @ActionNames("AssignBehaviorProjects")
    @RequiresLogin()
    public class AssignBehaviorProjectsAction extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/dataentry/behavior/AssignBehaviorProjects.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Assign Behavior Projects";
        }
    }

    @ActionNames("DiarrheaAnalysis")
    @RequiresLogin()
    public class DiarrheaAnalysisPage extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/clinical/DiarrheaAnalysis.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Diarrhea Analysis";
        }
    }

    @RequiresLogin
    public class AddBehaviorAssignmentAction extends ApiAction<AddBehaviorAssignmentForm>
    {

        @Override
        public Object execute(AddBehaviorAssignmentForm form, BindException errors) throws Exception
        {
            BehaviorDataEntryService.get(getUser(), getContainer()).addBehaviorAssignment(
                    form.getAnimalId(),
                    form.getProject(),
                    form.getAssignDate(),
                    form.getEstimatedReleaseDate(),
                    form.getRemark()
            );

            return null;
        }
    }

    @RequiresSiteAdmin
    @ActionNames("UploadBCReports")
    public class uploadBCReportAction extends ApiAction<Void>
    {
        @Override
        public Object execute(Void form, BindException errors) throws NotFoundException
        {
            BCReportManager manager = new BCReportManager(getUser(), getContainer());
            manager.uploadReports();

            return new JSONObject();
        }
    }

    @RequiresSiteAdmin
    @ActionNames("MakeUserWriterForBCReports")
    public class ShareBCReportsWithUserAction extends ApiAction<UserForm>
    {
        @Override
        public Object execute(UserForm form, BindException errors) throws Exception
        {
            WNPRC_EHRModule wnprc = ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);
            String id = wnprc.getGoogleDriveAccountId(getContainer());

            DriveWrapper drive = GoogleDriveService.get().getDrive(id, getUser());
            FolderWrapper bcFolder = drive.getFolder(BusinessContinuityReport.BusinessContinuityFolderName);

            bcFolder.shareWithUser(form.getUsername(), DriveSharePermission.WRITER);

            return new JSONObject();
        }
    }

    @RequiresSiteAdmin
    @ActionNames("ScheduleBCReports")
    public class ScheduleBCReportsAction extends ApiAction<Void>
    {
        @Override
        public Object execute(Void form, BindException errors)
        {
            BCReportRunner.schedule();
            return new JSONObject();
        }
    }

    @RequiresSiteAdmin
    @ActionNames("UnscheduleBCReports")
    public class UnscheduleBCReportsAction extends ApiAction<Void>
    {
        @Override
        public Object execute(Void form, BindException errors)
        {
            BCReportRunner.unschedule();
            return new JSONObject();
        }
    }

    /**
     * Redirects the data entry for a task to either /ehr/&lt;container&gt;/manageTask.view? or
     * /ehr/&lt;container&gt;/dataEntryForm.view? depending on the form type.
     */
    @SuppressWarnings("unused")
    @RequiresLogin
    @ActionNames("manageWnprcTask")
    public class ManageWnprcTaskAction extends RedirectAction<java.lang.Void>
    {
        // these constants are here to hopefully prevent us from mistyping the capitalization
        // later in the method. also, they should be different enough to avoid one-off typos
        // - clay, 23 Jan 2018
        private static final String CAMELCASE_FORMTYPE = "formType";
        private static final String LOWERCASE_FORMTYPE = "formtype";

        @Override
        public URLHelper getSuccessURL(java.lang.Void aVoid)
        {
            ActionURL oldUrl = getViewContext().getActionURL();
            ActionURL newUrl;
            Map<String, String[]> params = oldUrl.getParameterMap();
            // just to be safe, make sure we're reading the form type regardless of the capitalization
            // (it _should_ be all lowercase, but we should check anyway)
            String formType = MoreObjects.firstNonNull(
                    oldUrl.getParameter(LOWERCASE_FORMTYPE),
                    oldUrl.getParameter(CAMELCASE_FORMTYPE));
            switch (formType)
            {
                // this is the list of things that need redirected to the dataEntryForm.view in the EHR
                // module (the ExtJS 4 version, which is built from the other data entry Java classes)
                case "Necropsy":
                case "Breeding Encounter":
                    newUrl = new ActionURL(String.format("/ehr%s/dataEntryForm.view",
                            getContainer().getPath()));
                    // the ExtJS 4 data entry form expects "formType" with a capital 'T'
                    if (params.containsKey(LOWERCASE_FORMTYPE))
                        params.put(CAMELCASE_FORMTYPE, params.remove(LOWERCASE_FORMTYPE));
                    newUrl.addParameters(params);
                    break;
                // by default, all non-specified redirects will go to the manageTask.view in the EHR
                // module, which builds the forms in ExtJS 3 from the form types/sections defined in
                // the database (via the EHR module)
                default:
                    newUrl = new ActionURL(String.format("/ehr%s/manageTask.view",
                            getContainer().getPath()));
                    // the ExtJS 3 data entry form expects "formtype" all lower case
                    if (params.containsKey(CAMELCASE_FORMTYPE))
                        params.put(LOWERCASE_FORMTYPE, params.remove(CAMELCASE_FORMTYPE));
                    newUrl.addParameters(params);
                    break;
            }
            return newUrl;
        }

        @Override
        public boolean doAction(java.lang.Void aVoid, BindException errors)
        {
            return true;
        }
    }
}