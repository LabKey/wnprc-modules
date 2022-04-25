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
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.WordUtils;
import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.json.JSONArray;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.ApiUsageException;
import org.labkey.api.action.ExportAction;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SimpleRedirectAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.CoreSchema;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRDemographicsService;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.demographics.AnimalRecord;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.resource.DirectoryResource;
import org.labkey.api.resource.FileResource;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.CSRF;
import org.labkey.api.security.Group;
import org.labkey.api.security.GroupManager;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.security.RequiresNoPermission;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.RequiresSiteAdmin;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.ResultSetUtil;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.NotFoundException;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.googledrive.api.DriveSharePermission;
import org.labkey.googledrive.api.DriveWrapper;
import org.labkey.googledrive.api.FolderWrapper;
import org.labkey.googledrive.api.GoogleDriveService;
import org.labkey.security.xml.GroupEnumType;
import org.labkey.study.StudySchema;
import org.labkey.webutils.api.action.SimpleJspPageAction;
import org.labkey.webutils.api.action.SimpleJspReportAction;
import org.labkey.webutils.api.json.EnhancedJsonResponse;
import org.labkey.wnprc_ehr.bc.BCReportManager;
import org.labkey.wnprc_ehr.bc.BCReportRunner;
import org.labkey.wnprc_ehr.bc.BusinessContinuityReport;
import org.labkey.wnprc_ehr.calendar.Calendar;
import org.labkey.wnprc_ehr.calendar.OnCallCalendar;
import org.labkey.wnprc_ehr.data.ColonyCensus.AssignmentPerDiems;
import org.labkey.wnprc_ehr.data.ColonyCensus.ColonyCensus;
import org.labkey.wnprc_ehr.data.ColonyCensus.PopulationChangeEvent;
import org.labkey.wnprc_ehr.data.ColonyCensus.PopulationInstant;
import org.labkey.wnprc_ehr.data.ColonyCensus.PopulationsOverTime;
import org.labkey.wnprc_ehr.dataentry.validators.AnimalVerifier;
import org.labkey.wnprc_ehr.dataentry.validators.ProjectVerifier;
import org.labkey.wnprc_ehr.dataentry.validators.exception.InvalidAnimalIdException;
import org.labkey.wnprc_ehr.dataentry.validators.exception.InvalidProjectException;
import org.labkey.wnprc_ehr.email.EmailMessageUtils;
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
import java.nio.file.Paths;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static java.time.temporal.ChronoUnit.DAYS;

/**
 * User: bbimber
 * Date: 5/16/12
 * Time: 1:56 PM
 */
public class WNPRC_EHRController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_EHRController.class);
    private static Logger _log = Logger.getLogger(WNPRC_EHRController.class);

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

    DirectoryResource getModuleDataDir(String subdirectory)
    {
        Resource r = getModule().getModuleResource("data/" + subdirectory);
        DirectoryResource dir = ((DirectoryResource) r);

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
            DateFormat df = new SimpleDateFormat(EmailMessageUtils.VIROLOGY_DATE_FORMAT, Locale.ENGLISH);
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
    public static class ReleaseAnimalFromBehaviorAssignmentAction extends MutatingApiAction<ReleaseAnimalFromBehaviorAssignmentForm>
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
    public static class ValidateAnimalIdAction extends ReadOnlyApiAction<ValidateAnimalIdForm>
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
    public static class CheckIfAnimalIsAssigned extends ReadOnlyApiAction<CheckAnimalAssignment>
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
    @CSRF(CSRF.Method.POST)
    public class GetChangeLists extends ReadOnlyApiAction<Object>
    {
        @Override
        public ApiResponse execute(Object form, BindException errors) throws Exception
        {
            Map<String, Object> props = new HashMap<>();

            // Grab the changelists directory
            DirectoryResource changelistDir = getModuleDataDir("changelists");

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
    public class GetPopulationPerMonth extends ReadOnlyApiAction<Object>
    {
        @Override
        public ApiResponse execute(Object form, BindException errors)
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
    public class GetPopulationEventsOverPeriod extends MutatingApiAction<PopulationEventsOverPeriodForm>
    {
        @Override
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
    @CSRF(CSRF.Method.POST)
    public class GetAnimalDemographicsForRoomAction extends MutatingApiAction<GetAnimalDemographicsForRoomForm>
    {
        @Override
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
    public class BillablePerDiemsAction extends ReadOnlyApiAction<BillablePerDiemsForm>
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
    public class ExampleEmailAction extends MutatingApiAction<EmailForm>
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
    public class ListEmailsAction extends ReadOnlyApiAction<EmailServerForm>
    {
        @Override
        public ApiResponse execute(EmailServerForm form, BindException errors) throws Exception
        {
            return new ApiSimpleResponse(form.getEmailServer(getUser(), getContainer()).getInboxMessages());
        }
    }

    @ActionNames("getVirologyResultsFromEmail")
    @RequiresNoPermission()
    public class GetVirologyResultsFromEmailAction extends ReadOnlyApiAction<VirologyResultsForm>
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
    public class deleteEmailAction extends MutatingApiAction<VirologyResultsForm>
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
    public class previewEmailAction extends ReadOnlyApiAction<VirologyResultsForm>
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

    public static class DateRangeEvent
    {
        private Date startDate;
        private Date endDate;

        public Date getStartDate()
        {
            return startDate;
        }

        public void setStartDate(Date startDate)
        {
            this.startDate = startDate;
        }

        public Date getEndDate()
        {
            return endDate;
        }

        public void setEndDate(Date endDate)
        {
            this.endDate = endDate;
        }
    }

    @ActionNames("FetchOnCallScheduleGoogleEvents")
    //TODO @RequiresPermission("SomeGroupPermissionSettingHere")
    @RequiresLogin()
    public class FetchOnCallScheduleGoogleEventsAction extends ReadOnlyApiAction<DateRangeEvent>
    {
        @Override
        public Object execute(DateRangeEvent event, BindException errors)
        {
            JSONObject response = new JSONObject();
            response.put("success", false);

            try
            {
                Map<String, Object>[] onCallCalendars = getOnCallCalendars();

                //Calculate how many days to show on the schedule
                java.time.LocalDate startDate = java.time.LocalDate.ofInstant(event.getStartDate().toInstant(), ZoneId.systemDefault());
                java.time.LocalDate endDate = java.time.LocalDate.ofInstant(event.getEndDate().toInstant(), ZoneId.systemDefault());
                long daysBetween = DAYS.between(startDate, endDate);

                //Set the headers for the on call schedule html table
                JSONObject[][] onCallSchedule = new JSONObject[(int)daysBetween + 2][onCallCalendars.length + 2];
                onCallSchedule[0][0] = new JSONObject().put("html", "Date");
                onCallSchedule[0][1] = new JSONObject().put("html", "Day");
                for (int i = 0; i < onCallCalendars.length; i++) {
                    onCallSchedule[0][i + 2] = new JSONObject().put("html", onCallCalendars[i].get("display_name"));
                }
                //Set the dates in the html table
                for (int i = 0; i <= daysBetween; i++) {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
                    String dateText = startDate.plusDays(i).format(formatter);
                    onCallSchedule[i + 1][0] = new JSONObject().put("html", dateText);
                }
                //Set the days of the week in the html table
                for (int i = 0; i <= daysBetween; i++) {
                    onCallSchedule[i + 1][1] = new JSONObject().put("html", WordUtils.capitalizeFully(startDate.plusDays(i).getDayOfWeek().toString()));
                }

                //Fetch and then populate the events into the on call schedule html table in an easy way for the client side to read for each calendar
                for (int i = 0; i < onCallCalendars.length; i++) {
                    JSONArray events = new JSONArray();
                    boolean calendarReadSuccessful = true;
                    try {
                        Map<String, Object> row = onCallCalendars[i];
                        events = fetchCalendarEvents(new OnCallCalendar(), (String) row.get("calendar_id"), (String) row.get("calendar_type"), (String) row.get("default_bg_color"), event.getStartDate(), event.getEndDate());
                    } catch (Exception e) {
                        _log.error("Error retrieving events from on-call calendar with calendarId: " + onCallCalendars[i].get("calendar_id"));
                        onCallSchedule[0][i + 2] = new JSONObject().put("html", onCallCalendars[i].get("display_name") + "<br><span class='error-text'>Error: Failed to load</span>");
                        calendarReadSuccessful = false;
                    } finally {
                        organizeOnCallEvents(onCallSchedule, events, startDate, endDate, i + 2, calendarReadSuccessful);
                    }
                }

                response.put("success", true);
                response.put("onCallSchedule", onCallSchedule);
            }
            catch (Exception e)
            {
                _log.error("Error fetching/organizing on-call schedule", e);
                response.put("success", false);
            }

            return response;
        }
    }

    //Organize the calendar events into an easy format for the front end to parse
    private void organizeOnCallEvents(JSONObject[][] onCallSchedule, JSONArray events, java.time.LocalDate startDate, java.time.LocalDate endDate, int column, boolean calendarReadSuccessful) {
        long daysBetween = DAYS.between(startDate, endDate);
        for (int i = 0; i <= daysBetween; i++) {
            if (calendarReadSuccessful) {
                for (int j = 0; j < events.length(); j++) {
                    JSONObject event = events.getJSONObject(j);
                    if (startDate.plusDays(i).equals(event.get("date"))) {
                        if (onCallSchedule[i + 1][column] == null) {
                            onCallSchedule[i + 1][column] = new JSONObject();
                        }
                        //Replace <br> tags with newlines and then strip out any remaining html tags from title and description
                        //Once the strings are cleaned up, add back in the <br> tags instead of the newlines
                        String title = event.getString("title") != null ? event.getString("title") : "NO NAME";
                        title = title.replaceAll("(?i)<br */?>", "\n").trim();
                        title = Jsoup.parse(title).wholeText().replaceAll("\\R", "<br>");
                        String description = event.getString("description") != null ? event.getString("description") : "NO PHONE NUMBER";
                        description = description.replaceAll("(?i)<br */?>", "\n").trim();
                        description = Jsoup.parse(description).wholeText().replaceAll("\\R", "<br>");
                        if (onCallSchedule[i + 1][column].getString("html") == null) {
                            onCallSchedule[i + 1][column].put("html", "<strong>" + title + "<br>" + description + "</strong>");
                        } else {
                            onCallSchedule[i + 1][column].put("html", "<strong>" + onCallSchedule[i + 1][column].getString("html") + "<br>" + title + "<br>" + description + "</strong>");
                        }
                    }
                }
                if (onCallSchedule[i + 1][column] == null) {
                    onCallSchedule[i + 1][column] = new JSONObject().put("html", "<strong>NO DATA</strong>");
                }
            } else {
                onCallSchedule[i + 1][column] = new JSONObject();
                onCallSchedule[i + 1][column].put("html", "<span class='error-text'>Error: Failed to load</span>");
            }
        }
    }

    private Map<String, Object>[] getOnCallCalendars() {
        TableInfo ti = QueryService.get().getUserSchema(getUser(), getContainer(), "wnprc").getTable("on_call_calendars");
        Sort sort = new Sort("-display_name");

        Set<FieldKey> columns = new HashSet<>();
        columns.add(FieldKey.fromString("display_name"));
        columns.add(FieldKey.fromString("calendar_id"));
        columns.add(FieldKey.fromString("calendar_type"));
        columns.add(FieldKey.fromString("default_bg_color"));
        columns.add(FieldKey.fromString("requires_authorization"));
        columns.add(FieldKey.fromString("authorized_groups"));
        final Map<FieldKey, ColumnInfo> colMap = QueryService.get().getColumns(ti, columns);

        TableSelector ts = new TableSelector(ti, colMap.values(), null, sort);
        Map<String, Object>[] queryResults = ts.getMapArray();

        List<Map<String, Object>> authorizedCalendars = new ArrayList();

        //Only return calendars that the user is authorized to view
        for (int i = 0; i < queryResults.length; i++) {
            if (queryResults[i].get("requires_authorization") != null && (Boolean) queryResults[i].get("requires_authorization")) {
                String authorizedGroupsString = (String) queryResults[i].get("authorized_groups");
                if (authorizedGroupsString != null) {
                    String[] authorizedGroups = authorizedGroupsString.trim().split("\\s*,\\s*");
                    for (int j = 0; j < authorizedGroups.length; j++) {
                        Group authorizedGroup = GroupManager.getGroup(getContainer(), authorizedGroups[j], GroupEnumType.SITE);
                        if (getUser().isInGroup(authorizedGroup.getUserId()) || getUser().isInSiteAdminGroup()) {
                            authorizedCalendars.add(queryResults[i]);
                            break;
                        }
                    }
                }
            } else {
                authorizedCalendars.add(queryResults[i]);
            }
        }

        Map<String, Object>[] onCallCalendars = new Map[authorizedCalendars.size()];
        return authorizedCalendars.toArray(onCallCalendars);
    }

    private JSONArray fetchCalendarEvents(Calendar calendar, String calendarId, String calendarType, String backgroundColor, Date startDate, Date endDate) throws Exception
    {
        calendar.setUser(getUser());
        calendar.setContainer(getContainer());
        JSONArray events = null;
        if (calendarType.equalsIgnoreCase("Office365Resource"))
        {
            events = calendar.getEventsAsJson(calendarId, backgroundColor, Calendar.EventType.ROOM, startDate, endDate);
        }
        else
        {
            events = calendar.getEventsAsJson(calendarId, backgroundColor, Calendar.EventType.CALENDAR, startDate, endDate);
        }
        return events;
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
            return "/org/labkey/wnprc_ehr/pages/dataentry/NecropsySchedule.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Necropsy Schedule";
        }
    }

    @ActionNames("PathologyCaseList")
    @RequiresLogin()
    public class PathologyCaseListAction extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "/org/labkey/wnprc_ehr/pages/dataentry/PathologyCaseList.jsp";
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
            return "/org/labkey/wnprc_ehr/pages/dataentry/NecropsyReport.jsp";
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
            return "/org/labkey/wnprc_ehr/pages/dataentry/NecropsyCollectionList.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Necropsy Collection List";
        }
    }

    @ActionNames("OnCallCalendar")
    @RequiresLogin()
    public class OnCallCalendarAction extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "/org/labkey/wnprc_ehr/pages/calendars/OnCallCalendar.jsp";
        }

        @Override
        public String getTitle()
        {
            return "On Call Calendar";
        }
    }

    @ActionNames("OnCallCalendarPrintable")
    @RequiresLogin()
    public class OnCallCalendarPrintableAction extends WNPRCReportPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "/org/labkey/wnprc_ehr/pages/calendars/OnCallCalendar.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Printable On Call Calendar";
        }
    }

    @ActionNames("ColonyCensus")
    @RequiresLogin()
    public class ColonyCensusAction extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "/org/labkey/wnprc_ehr/pages/population_management/ColonyCensus.jsp";
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
            return "/org/labkey/wnprc_ehr/pages/population_management/PerDiems.jsp";
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
            return "/org/labkey/wnprc_ehr/pages/dataentry/behavior/AssignBehaviorProjects.jsp";
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
            return "/org/labkey/wnprc_ehr/pages/clinical/DiarrheaAnalysis.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Diarrhea Analysis";
        }
    }

    @RequiresLogin
    public class AddBehaviorAssignmentAction extends MutatingApiAction<AddBehaviorAssignmentForm>
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
    public class uploadBCReportAction extends MutatingApiAction<Object>
    {
        @Override
        public Object execute(Object form, BindException errors) throws NotFoundException
        {
            BCReportManager manager = new BCReportManager(getUser(), getContainer());
            manager.uploadReports();

            return new JSONObject();
        }
    }

    @RequiresSiteAdmin
    @ActionNames("MakeUserWriterForBCReports")
    public class ShareBCReportsWithUserAction extends MutatingApiAction<UserForm>
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
    public class ScheduleBCReportsAction extends MutatingApiAction<Object>
    {
        @Override
        public Object execute(Object form, BindException errors)
        {
            BCReportRunner.schedule();
            return new JSONObject();
        }
    }

    @RequiresSiteAdmin
    @ActionNames("UnscheduleBCReports")
    public class UnscheduleBCReportsAction extends MutatingApiAction<Object>
    {
        @Override
        public Object execute(Object form, BindException errors)
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
    public class ManageWnprcTaskAction extends SimpleRedirectAction<Object>
    {
        // these constants are here to hopefully prevent us from mistyping the capitalization
        // later in the method. also, they should be different enough to avoid one-off typos
        // - clay, 23 Jan 2018
        private static final String CAMELCASE_FORMTYPE = "formType";
        private static final String LOWERCASE_FORMTYPE = "formtype";

        @Override
        public @Nullable URLHelper getRedirectURL(Object aVoid)
        {
            ActionURL oldUrl = getViewContext().getActionURL();
            ActionURL newUrl;
            Map<String, String[]> params = oldUrl.getParameterMap();
            // just to be safe, make sure we're reading the form type regardless of the capitalization
            // (it _should_ be all lowercase, but we should check anyway)
            String formType = (oldUrl.getParameter(LOWERCASE_FORMTYPE) == null) ? oldUrl.getParameter(CAMELCASE_FORMTYPE): oldUrl.getParameter(LOWERCASE_FORMTYPE);
            formType = formType != null ? formType.toLowerCase() : null;

            switch (formType)
            {

                case "feeding":
                    newUrl = new ActionURL(String.format("/wnprc_ehr%s/feeding.view",
                            getContainer().getPath()));
                    newUrl.addParameters(params);
                    break;
                case "weight":
                    newUrl = new ActionURL(String.format("/wnprc_ehr%s/weight.view",
                            getContainer().getPath()));
                    newUrl.addParameters(params);
                    break;
                // this is the list of things that need redirected to the dataEntryForm.view in the EHR
                // module (the ExtJS 4 version, which is built from the other data entry Java classes)
                case "necropsy":
                case "breeding encounter":
                case "enter water orders":
                case "enter lab water":
                case "enter treatments - water":
                case "enter water daily amount":
                case "research ultrasounds":
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

    }

    public String getVLStatus(User user, Container container, Integer status) throws SQLException
    {
      SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Key"), status);
      QueryHelper viralLoadQuery = new QueryHelper(container, user, "lists", "status");

      // Define columns to get
      List<FieldKey> columns = new ArrayList<>();
      columns.add(FieldKey.fromString("Key"));
      columns.add(FieldKey.fromString("Status"));
      // Execute the query
      String thestatus = null;
      try ( Results rs = viralLoadQuery.select(columns, filter) )
      {
          if (rs.next()){
              thestatus = rs.getString(FieldKey.fromString("Status"));
          }
      }
      return thestatus;
    }

    /**
     * Action definition to import historical/test data for the breeding datasets. Called from the web application,
     * not from Java.
     */
    @SuppressWarnings("unused")
    @RequiresPermission(AdminPermission.class)
    public static class ImportDatasetDataAction extends MutatingApiAction<Object>
    {
        @Override
        public Object execute(Object aVoid, BindException errors)
        {
            // TODO: create, parse, and load some test data
            return new ApiSimpleResponse("success", true);
        }
    }

    @SuppressWarnings("unused")
    @RequiresPermission(AdminPermission.class)
    public static class ImportDatasetMetadataAction extends MutatingApiAction<Object>
    {
        @Override
        public Object execute(Object aVoid, BindException errors) throws Exception
        {
            Module module = ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);
            assert module != null;

            File file = new File(Paths.get(module.getExplodedPath().getAbsolutePath(), "pregnancySubsetReferenceStudy", "study").toFile(),
                    "study.xml");
            DatasetImportHelper.importDatasetMetadata(getUser(), getContainer(), file);
            return new ApiSimpleResponse("success", true);
        }
    }

    @ActionNames("WaterCalendar")
    @RequiresLogin()
    public class WaterCalendarAction extends WNPRCJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "/org/labkey/wnprc_ehr/pages/husbandry/WaterCalendar.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Water Calendar";
        }
    }

    @ActionNames("UpdateWaterAmount")
    @RequiresLogin
    public class UpdateWaterAmountAction extends MutatingApiAction<WaterOrderRecord>
    {
        @Override
        public Object execute (WaterOrderRecord event, BindException errors) throws Exception{

            List<Map<String, Object>> WaterAmountRows = getWaterAmountRecord(event.getObjectId());

            JSONObject response = new JSONObject();
            response.put("success", false);

            TableInfo ti = null;
            QueryUpdateService service = null;
            List<Map<String, Object>> rowToUpdate = null;

            if (event.getDataSource().equals("waterAmount"))
            {
                ti = QueryService.get().getUserSchema(getUser(), getContainer(), "study").getTable("waterAmount");

                try (DbScope.Transaction transaction = WNPRC_Schema.getWnprcDbSchema().getScope().ensureTransaction())
                {

                    if (event.getAction().equals("update"))
                    {
                        for (Map<String, Object> woRow : WaterAmountRows)
                        {
                            JSONObject waterAmountRecord = new JSONObject();
                            waterAmountRecord.put("taskid", woRow.get("taskid"));
                            waterAmountRecord.put("objectid", event.getObjectId());
                            waterAmountRecord.put("volume", event.getVolume());
                            waterAmountRecord.put("provideFruit", event.getProvideFruit());
                            waterAmountRecord.put("date", event.getDate());
                            waterAmountRecord.put("assignedTo", event.getAssignedTo());
                            waterAmountRecord.put("frequency", event.getFrequency());
                            waterAmountRecord.put("qcstate", EHRService.QCSTATES.Scheduled.getQCState(getContainer()).getRowId());
                            rowToUpdate = SimpleQueryUpdater.makeRowsCaseInsensitive(waterAmountRecord);


                            service = ti.getUpdateService();

                            List<Map<String, Object>> updatedRows = service.updateRows(getUser(), getContainer(), rowToUpdate, rowToUpdate, null, null);
                            if (updatedRows.size() != rowToUpdate.size())
                            {
                                throw new QueryUpdateServiceException("Not all rows updated properly");
                            }

                        }
                    }
                    if ("delete".equals(event.getAction()))
                    {
                        _log.error("Deleting waterAmount with objectId "+ event.getObjectId());

                        SimpleQueryUpdater waterAmountTable = new SimpleQueryUpdater(getUser(),getContainer(),"study", "waterAmount");
                        JSONObject rowToDelete = new JSONObject();
                        rowToDelete.put("objectId", event.getObjectId());
                        waterAmountTable.delete(rowToDelete);

                        

                    }

                    transaction.commit();
                    response.put("success", true);

                }
                catch (Exception e)
                {

                    response.put("success", false);

                }
                finally
                {

                }
            }

            return response;

        }

    }



    @ActionNames("CloseWaterOrder")
    @RequiresLogin
    public class CloseWaterOrderAction extends MutatingApiAction<WaterOrderRecord>
    {
        @Override
        public Object execute (WaterOrderRecord event, BindException errors) throws Exception{

            List<Map<String, Object>> WaterOrdersRows = getWaterOrderRecord(event.getObjectId());

            JSONObject response = new JSONObject();
            response.put("success", false);

            TableInfo ti = null;
            QueryUpdateService service = null;
            List<Map<String, Object>> rowToUpdate = null;

            if (event.getDataSource().equals("waterOrders"))
            {
                Map <String,Object> extraContext = new HashMap<>();

                try (DbScope.Transaction transaction = WNPRC_Schema.getWnprcDbSchema().getScope().ensureTransaction())
                {

                    for (Map<String, Object> woRow : WaterOrdersRows)
                    {
                        JSONObject waterOrderRecord = new JSONObject();
                        waterOrderRecord.put("taskid", woRow.get("taskid"));
                        waterOrderRecord.put("objectid", event.getObjectId());
                        waterOrderRecord.put("enddate", event.getEndDate());
                        if (event.isSkipWaterRegulationCheck()){
                            waterOrderRecord.put("skipWaterRegulationCheck", true);
                        }
                        rowToUpdate = SimpleQueryUpdater.makeRowsCaseInsensitive(waterOrderRecord);

                        ti = QueryService.get().getUserSchema(getUser(), getContainer(), "study").getTable("waterOrders");
                        service = ti.getUpdateService();

                        List<Map<String, Object>> updatedRows = service.updateRows(getUser(), getContainer(), rowToUpdate, rowToUpdate, null, extraContext);
                        if (updatedRows.size() != rowToUpdate.size())
                        {
                            throw new QueryUpdateServiceException("Not all rows updated properly");
                        }

                    }

                    transaction.commit();
                    response.put("success", true);

                }
                catch (BatchValidationException e){
                    response.put("success", false);

                    response.put("errors", createResponseWriter().getJSON(e).get("errors"));
                    response.put("extraContext", extraContext);

                }
                catch (Exception e)
                {

                    response.put("success", false);


                }

                finally
                {

                }
            }

            return response;

        }

    }
    //Starts a new water order one day after the end of the currently selected water order
    // This method is used on the WaterCalendar to easily modify existing water orders.
    @ActionNames("EnterNewWaterOrder")
    @RequiresLogin
    public class EnterNewWaterOrderAction extends MutatingApiAction<WaterOrderRecord>
    {
        @Override
        public Object execute (WaterOrderRecord event, BindException errors) throws Exception{

            List<Map<String, Object>> WaterOrdersRows = getWaterOrderRecord(event.getObjectId());

            JSONObject response = new JSONObject();
            response.put("success", false);

            TableInfo ti = null;
            QueryUpdateService service = null;
            List<Map<String, Object>> rowToUpdate = null;

            if (event.getDataSource().equals("waterOrders"))
            {

                try (DbScope.Transaction transaction = WNPRC_Schema.getWnprcDbSchema().getScope().ensureTransaction())
                {

                    for (Map<String, Object> woRow : WaterOrdersRows)
                    {
                        JSONObject waterOrderRecord = new JSONObject();
                        waterOrderRecord.put("taskid", woRow.get("taskid"));
                        waterOrderRecord.put("objectid", event.getObjectId());
                        waterOrderRecord.put("enddate", event.getEndDate());
                        waterOrderRecord.put("skipWaterRegulationCheck", true);
                        rowToUpdate = SimpleQueryUpdater.makeRowsCaseInsensitive(waterOrderRecord);

                        ti = QueryService.get().getUserSchema(getUser(), getContainer(), "study").getTable("waterOrders");
                        service = ti.getUpdateService();

                        List<Map<String, Object>> updatedRows = service.updateRows(getUser(), getContainer(), rowToUpdate, rowToUpdate, null, null);
                        if (updatedRows.size() != rowToUpdate.size())
                        {
                            throw new QueryUpdateServiceException("Not all rows updated properly");
                        }

                    }

                    //Start new water order
                    List<Map<String, Object>> rowToInsert = null;
                    List<Map<String, Object>> taskToInsert = null;
                    JSONObject taskRecord = new JSONObject();
                    JSONObject waterOrderRow = new JSONObject();

                    String taskId = UUID.randomUUID().toString();
                    taskRecord.put("taskid", taskId);
                    taskRecord.put("title", "Enter Water Orders");
                    taskRecord.put("category", "task");
                    taskRecord.put("qcstate", EHRService.QCSTATES.Completed.getQCState(getContainer()).getRowId());
                    taskRecord.put("formType","Enter Water Orders");
                    taskRecord.put("assignedTo",getUser().getUserId());



                    taskToInsert = SimpleQueryUpdater.makeRowsCaseInsensitive(taskRecord);

                    ti = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr").getTable("tasks");
                    service = ti.getUpdateService();

                    BatchValidationException validationTaskException = new BatchValidationException();
                    List<Map<String, Object>> insertedTask = service.insertRows(getUser(), getContainer(), taskToInsert, validationTaskException, null, null);

                    java.util.Calendar StartDate = java.util.Calendar.getInstance();
                    StartDate.setTime(event.getEndDate());
                    StartDate.add(java.util.Calendar.DATE, 1);

                    waterOrderRow.put("taskid", taskId);
                    waterOrderRow.put("date",StartDate.getTime());
                    waterOrderRow.put("id",event.getAnimalId());
                    waterOrderRow.put("project",event.getProject());
                    waterOrderRow.put("frequency", event.getFrequency());
                    waterOrderRow.put("volume", event.getVolume());
                    waterOrderRow.put("assignedTo", event.getAssignedTo());
                    waterOrderRow.put("waterSource","regulated");

                    rowToInsert = SimpleQueryUpdater.makeRowsCaseInsensitive(waterOrderRow);

                    ti = QueryService.get().getUserSchema(getUser(), getContainer(), "study").getTable("waterOrders");
                    service = ti.getUpdateService();

                    BatchValidationException validationException = new BatchValidationException();
                    List<Map<String, Object>> insertedRows = service.insertRows(getUser(), getContainer(), rowToInsert, validationException, null, null);

                    if (validationException.hasErrors())
                    {
                        throw validationException;
                    }

                    if (taskToInsert.size() != insertedTask.size() || rowToInsert.size() != insertedRows.size()){
                        throw new QueryUpdateServiceException("Task record or water record not inserted");
                    }





                    transaction.commit();
                    //TODO: return JSON string with taskid and success

                    //JSONObject returnJSON = new JSONObject();
                    response.put("success", true);
                    response.put("taskId", taskId);


                    //response.put(returnJSON);

                }
                catch (Exception e)
                {

                    response.put("success", false);

                }
                finally
                {

                }
            }

            return response;

        }

    }

    // TODO: consolidate the water order and water amount class to have only a WaterInfo that can handle
    // the two different scenarios

    public static class WaterOrderRecord {


        private String taskId;
        private String objectId;
        private String animalId;
        private String project;
        private Date date;
        private Date endDate;
        private long dateInMillis;
        private Double volume;
        private String provideFruit;
        private String dataSource;
        private String waterSource;
        private String frequency;
        private String assignedTo;
        private String action;
        private boolean skipWaterRegulationCheck;


        public void setTaskId(String taskId)
        {
            this.taskId = taskId;
        }

        public void setObjectId(String objectId)
        {
            this.objectId = objectId;
        }

        public void setAnimalId(String animalId)
        {
            this.animalId = animalId;
        }

        public void setDate(Date date)
        {
            this.date = date;
        }
        public void setDate(String date)
        {
            //DateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm");
            long miliseconds = Long.parseLong(date);
            java.util.Calendar calendar = java.util.Calendar.getInstance();
            calendar.setTimeInMillis(miliseconds);
            this.date = calendar.getTime();
        }
        public void setDateInMillis(long dateInMillis)
        {
            if (dateInMillis>0)
            {
                java.util.Calendar calendar = java.util.Calendar.getInstance();
                calendar.setTimeInMillis(dateInMillis);
                this.date = calendar.getTime();
            }
            this.dateInMillis = dateInMillis;
        }

        public long getDateInMillis()
        {
            return dateInMillis;
        }

        public void setProject(String project)
        {
            this.project = project;
        }

        public void setEndDate(Date endDate)
        {
            this.endDate = endDate;
        }

        public void setDataSource(String dataSource)
        {
            this.dataSource = dataSource;
        }

        public void setWaterSource(String waterSource)
        {
            this.waterSource = waterSource;
        }

        public void setFrequency(String frequency)
        {
            this.frequency = frequency;
        }

        public void setVolume(Double volume)
        {
            this.volume = volume;
        }

        public void setProvideFruit(String provideFruit)
        {
            this.provideFruit = provideFruit;
        }

        public void setAssignedTo(String assignedTo)
        {
            this.assignedTo = assignedTo;
        }

        public void setAction(String action)
        {
            this.action = action;
        }

        public String getTaskId()
        {
            return taskId;
        }

        public String getObjectId()
        {
            return objectId;
        }

        public String getAnimalId()
        {
            return animalId;
        }

        public Date getDate()
        {
            return date;
        }

        public Date getEndDate()
        {
            return endDate;
        }

        public String getDataSource()
        {
            return dataSource;
        }

        public String getWaterSource()
        {
            return waterSource;
        }

        public String getProject()
        {
            return project;
        }

        public String getFrequency()
        {
            return frequency;
        }

        public Double getVolume()
        {
            return volume;
        }

        public String getProvideFruit()
        {
            return provideFruit;
        }

        public String getAssignedTo()
        {
            return assignedTo;
        }

        public String getAction()
        {
            return action;
        }

        public boolean isSkipWaterRegulationCheck()
        {
            return skipWaterRegulationCheck;
        }

        public void setSkipWaterRegulationCheck(boolean skipWaterRegulationCheck)
        {
            this.skipWaterRegulationCheck = skipWaterRegulationCheck;
        }


    }

    private List<Map<String, Object>> getWaterOrderRecord (String objectId) throws java.sql.SQLException{
        List<FieldKey> columns = new ArrayList<>();

        columns.add(FieldKey.fromString("id"));
        columns.add(FieldKey.fromString("objectid"));
        columns.add(FieldKey.fromString("taskid"));
        columns.add(FieldKey.fromString("date"));
        columns.add(FieldKey.fromString("enddate"));

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("objectid"), objectId);
        QueryHelper waterOrderQuery = new QueryHelper(getContainer(), getUser(), "study","waterOrders");
        List<Map<String, Object>> woRows = new ArrayList<>();
        try (Results rs = waterOrderQuery.select(columns, filter))
        {
            while (rs.next())
            {
                woRows.add(rs.getRowMap());
            }
        }
        return woRows;
    }

    /*public static class WaterAmountRecord {

        private String taskId;
        private String objectId;
        private String animalId;
        private Date date;
        private Double volume;
        private String dataSource;
        private String frequency;
        private String assignedTo;

        public void setTaskId(String taskId)
        {
            this.taskId = taskId;
        }

        public void setObjectId(String objectId)
        {
            this.objectId = objectId;
        }

        public void setAnimalId(String animalId)
        {
            this.animalId = animalId;
        }

        public void setDate(Date endDate)
        {
            this.date = date;
        }

        public void setDataSource(String dataSource)
        {
            this.dataSource = dataSource;
        }

        public void setVolume(Double volume)
        {
            this.volume = volume;
        }

        public void setFrequency(String frequency)
        {
            this.frequency = frequency;
        }

        public void setAssignedTo(String assignedTo)
        {
            this.assignedTo = assignedTo;
        }

        public String getFrequency()
        {
            return frequency;
        }

        public String getAssignedTo()
        {
            return assignedTo;
        }

        public String getTaskId()
        {
            return taskId;
        }

        public String getObjectId()
        {
            return objectId;
        }

        public String getAnimalId()
        {
            return animalId;
        }

        public Date getDate()
        {
            return date;
        }

        public String getDataSource()
        {
            return dataSource;
        }

        public Double getVolume()
        {
            return volume;
        }

    }*/

    private List<Map<String, Object>> getWaterAmountRecord (String objectId) throws java.sql.SQLException{
        List<FieldKey> columns = new ArrayList<>();

        columns.add(FieldKey.fromString("id"));
        columns.add(FieldKey.fromString("objectid"));
        columns.add(FieldKey.fromString("taskid"));
        columns.add(FieldKey.fromString("date"));


        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("objectid"), objectId);
        QueryHelper waterOrderQuery = new QueryHelper(getContainer(), getUser(), "study","waterAmount");
        Results rs = waterOrderQuery.select(columns, filter);

        List<Map<String, Object>> woRows = new ArrayList<>();
        while (rs.next())
        {
            woRows.add(rs.getRowMap());
        }
        rs.close();
        return woRows;

    }

    /* TODO: This is an API to clean up an inconsistency in the performed by column of study.obs dataset. Once the
     underlying issue is resolved, this API can be deleted.
     */
    @RequiresPermission(AdminPermission.class)
    public class CorrectObsUserIdsAction extends MutatingApiAction<Object>
    {
        @Override
        public Object execute(Object o, BindException errors) throws Exception
        {
            DbSchema studySchema = StudySchema.getInstance().getSchema();
            Dataset obsDataset = StudyService.get().getStudy(getContainer()).getDatasetByName("obs");
//            TableInfo obsTable = studySchema.getTable("obs");

            if (null == obsDataset)
            {
                errors.reject(ERROR_MSG, "study.obs dataset not found. Ensure you are in the right folder.");
                return false;
            }

            Domain obsDomain = obsDataset.getTableInfo(getUser()).getDomain();
            if (null == obsDomain)
            {
                errors.reject(ERROR_MSG, "study.obs domain not found.");
                return false;
            }

            SQLFragment sql = new SQLFragment("UPDATE studydataset.").append(obsDomain.getStorageTableName()).append(" o SET performedBy = s.performedBy FROM (\n ")
                    .append("SELECT ob.lsid, COALESCE(ud.displayname, ob.performedBy) as performedBy FROM ").append(obsDataset.getTableInfo(getUser()), "ob").append("\n")
                    .append("LEFT JOIN ").append(CoreSchema.getInstance().getTableInfoUsersData(),"ud").append(" ON CAST(ud.userid AS VARCHAR) = ob.performedBy\n")
                    .append(") s WHERE s.lsid = o.lsid");

            new SqlExecutor(studySchema).execute(sql);

            ApiSimpleResponse response = new ApiSimpleResponse();
            response.put("success", true);
            return response;
        }
    }
}
