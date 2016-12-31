/*
 * Copyright (c) 2009-2016 LabKey Corporation
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

package org.labkey.ehr;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.ConfirmAction;
import org.labkey.api.action.SimpleErrorView;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.JsonWriter;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.demographics.AnimalRecord;
import org.labkey.api.ehr.history.HistoryRow;
import org.labkey.api.ehr.security.EHRDataEntryPermission;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.pipeline.PipelineStatusUrls;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryAction;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryForm;
import org.labkey.api.query.QueryParseException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.QueryWebPart;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationError;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.CSRF;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.settings.AppProps;
import org.labkey.api.study.DatasetTable;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.NotFoundException;
import org.labkey.api.view.Portal;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.view.WebPartView;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.ehr.dataentry.DataEntryManager;
import org.labkey.ehr.dataentry.RecordDeleteRunner;
import org.labkey.ehr.demographics.EHRDemographicsServiceImpl;
import org.labkey.ehr.history.ClinicalHistoryManager;
import org.labkey.ehr.history.LabworkManager;
import org.labkey.ehr.pipeline.GeneticCalculationsJob;
import org.labkey.ehr.pipeline.GeneticCalculationsRunnable;
import org.labkey.ehr.query.BloodPlotData;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class EHRController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new EHRActionResolver();

    public EHRController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    @CSRF
    public class GetDataEntryItemsAction extends ApiAction<GetDataEntryItemsForm>
    {
        public ApiResponse execute(GetDataEntryItemsForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            Collection<DataEntryForm> forms = DataEntryManager.get().getForms(getContainer(), getUser());
            List<JSONObject> formJson = new ArrayList<>();
            for (DataEntryForm def : forms)
            {
                formJson.add(def.toJSON(form.isIncludeFormElements()));
            }

            resultProperties.put("forms", formJson);
            resultProperties.put("success", true);

            return new ApiSimpleResponse(resultProperties);
        }
    }

    public static class GetDataEntryItemsForm
    {
        private boolean _includeFormElements = false;

        public boolean isIncludeFormElements()
        {
            return _includeFormElements;
        }

        public void setIncludeFormElements(boolean includeFormElements)
        {
            _includeFormElements = includeFormElements;
        }
    }

    public static class CacheLivingAnimalsForm
    {
        private boolean _includeAll;

        public boolean isIncludeAll()
        {
            return _includeAll;
        }

        public void setIncludeAll(boolean includeAll)
        {
            _includeAll = includeAll;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class CacheLivingAnimalsAction extends ConfirmAction<CacheLivingAnimalsForm>
    {
        public void validateCommand(CacheLivingAnimalsForm form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(CacheLivingAnimalsForm form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getConfirmView(CacheLivingAnimalsForm form, BindException errors) throws Exception
        {
            return new HtmlView("This action will force the EHR to cache demographics data on all " + (form.isIncludeAll() ? "" : "living") + " animals, and log errors if there is an existing record that does not match the current record.  This can save significant time during data entry or other screens.  Do you want to do this?<br><br>");
        }

        public boolean handlePost(CacheLivingAnimalsForm form, BindException errors) throws Exception
        {
            EHRDemographicsServiceImpl.get().cacheAnimals(getContainer(), getUser(), true, !form.isIncludeAll());
            return true;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class PrimeDataEntryCacheAction extends ConfirmAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getConfirmView(Object form, BindException errors) throws Exception
        {
            return new HtmlView("This action will cause the EHR to populate several cached items used in data entry, such as reference tables.  Do you want to do this?<br><br>");
        }

        public boolean handlePost(Object form, BindException errors) throws Exception
        {
            DataEntryManager.get().primeCachesForContainer(getContainer(), getUser());
            return true;
        }
    }

    @RequiresPermission(DeletePermission.class)
    @CSRF
    public class DiscardFormAction extends ApiAction<DiscardFormForm>
    {
        public ApiResponse execute(DiscardFormForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();
            Map<String, List<String>> errorMsgMap = new HashMap<>();

            //first verify permission to delete
            if (form.getTaskIds() != null)
            {
                boolean canDiscard = true;
                for (String taskId : form.getTaskIds())
                {
                    List<String> msgs = new ArrayList<>();
                    if (!EHRManager.get().canDiscardTask(getContainer(), getUser(), taskId, msgs))
                    {
                        canDiscard = false;
                        errorMsgMap.put(taskId, msgs);
                    }
                }

                if (canDiscard)
                {
                    try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
                    {
                        for (String taskId : form.getTaskIds())
                        {
                            EHRManager.get().discardTask(getContainer(), getUser(), taskId);
                        }

                        transaction.commit();
                    }
                    catch (SQLException e)
                    {
                        throw new RuntimeSQLException(e);
                    }
                }
                else
                {
                    errors.reject(ERROR_MSG, "You do not have permission to delete one or more of these tasks");
                    return null;
                }
            }
            else
            {
                errors.reject(ERROR_MSG, "No tasks provided");
                return null;
            }

            resultProperties.put("success", true);

            return new ApiSimpleResponse(resultProperties);
        }
    }

    public static class DiscardFormForm
    {
        private String[] taskIds;
        private String[] requestIds;

        public String[] getTaskIds()
        {
            return taskIds;
        }

        public void setTaskIds(String[] taskIds)
        {
            this.taskIds = taskIds;
        }

        public String[] getRequestIds()
        {
            return requestIds;
        }

        public void setRequestIds(String[] requestIds)
        {
            this.requestIds = requestIds;
        }
    }

    @RequiresPermission(UpdatePermission.class)
    public class UpdateQueryAction extends SimpleViewAction<EHRQueryForm>
    {
        private EHRQueryForm _form;

        public ModelAndView getView(EHRQueryForm form, BindException errors) throws Exception
        {
            ensureQueryExists(form);

            _form = form;

            String schemaName = form.getSchemaName();

            QueryView queryView = QueryView.create(form, errors);
            TableInfo ti = queryView.getTable();
            List<String> pks = ti.getPkColumnNames();
            String keyField = null;

            String queryName =  (ti instanceof DatasetTable) ? ti.getTitle() : ti.getName();

            if (pks.size() == 1)
                keyField = pks.get(0);

            ActionURL url = getViewContext().getActionURL().clone();

            if (keyField != null)
            {
                String detailsStr;
                String importStr;
                if (EHRServiceImpl.get().isUseLegagyExt3EditUI(getContainer()))
                {
                    detailsStr = "/ehr/manageRecord.view?schemaName=" + schemaName + "&queryName=" + queryName;
                    importStr = "";
                    for (String pkCol : ti.getPkColumnNames())
                    {
                        detailsStr += "&keyField=" + pkCol + "&key=${" + pkCol + "}";
                        importStr += "&key=" + pkCol;
                    }

                    if (form.isShowImport())
                    {
                        DetailsURL importUrl = DetailsURL.fromString("/ehr/manageRecord.view?schemaName=" + schemaName + "&queryName=" + queryName + importStr);
                        importUrl.setContainerContext(getContainer());

                        url.addParameter("importURL", importUrl.toString());
                    }
                }
                else
                {
                    detailsStr = "/ehr/dataEntryFormForQuery.view?schemaName=" + schemaName + "&queryName=" + queryName;
                    importStr = "";
                    for (String pkCol : ti.getPkColumnNames())
                    {
                        detailsStr += "&" + pkCol + "=${" + pkCol + "}";
                        importStr += "&" + pkCol + "=";
                    }

                    if (form.isShowImport())
                    {
                        DetailsURL importUrl = DetailsURL.fromString("/ehr/dataEntryFormForQuery.view?schemaName=" + schemaName + "&queryName=" + queryName + importStr);
                        importUrl.setContainerContext(getContainer());

                        url.addParameter("importURL", importUrl.toString());
                    }
                }

                DetailsURL updateUrl = DetailsURL.fromString(detailsStr);
                updateUrl.setContainerContext(getContainer());

                DetailsURL deleteUrl = DetailsURL.fromString("/query/deleteQueryRows.view?schemaName=" + schemaName + "&query.queryName=" + queryName);
                deleteUrl.setContainerContext(getContainer());

                url.addParameter("updateURL", updateUrl.toString());
                url.addParameter("deleteURL", deleteUrl.toString());
                url.addParameter("showInsertNewButton", false);
            }

            url.addParameter("queryName", queryName);
            url.addParameter("allowChooseQuery", false);
            url.addParameter("dataRegionName", "query");

            WebPartFactory factory = Portal.getPortalPartCaseInsensitive("Query");
            Portal.WebPart part = factory.createWebPart();
            part.setProperties(url.getQueryString());

            QueryWebPart qwp = new QueryWebPart(getViewContext(), part);
            qwp.setTitle(ti.getTitle());
            qwp.setFrame(WebPartView.FrameType.NONE);
            return qwp;
        }

        public NavTree appendNavTrail(NavTree root)
        {
            TableInfo ti = null;
            try
            {
                ti = _form.getSchema() == null ? null : _form.getSchema().getTable(_form.getQueryName());
            }
            catch (QueryParseException x)
            {
                /* */
            }

            root.addChild(ti == null ? _form.getQueryName() : ti.getTitle(), _form.urlFor(QueryAction.executeQuery));
            return root;
        }

        protected void ensureQueryExists(EHRQueryForm form)
        {
            if (form.getSchema() == null)
            {
                throw new NotFoundException("Could not find schema: " + form.getSchemaName());
            }

            if (StringUtils.isEmpty(form.getQueryName()))
            {
                throw new NotFoundException("Query not specified");
            }

            if (!queryExists(form))
            {
                throw new NotFoundException("Query '" + form.getQueryName() + "' in schema '" + form.getSchemaName() + "' doesn't exist.");
            }
        }

        protected boolean queryExists(EHRQueryForm form)
        {
            try
            {
                return form.getSchema() != null && form.getSchema().getTable(form.getQueryName()) != null;
            }
            catch (QueryParseException x)
            {
                // exists with errors
                return true;
            }
            catch (QueryException x)
            {
                // exists with errors
                return true;
            }
        }
    }

    public static class EHRQueryForm extends  QueryForm
    {
        private boolean _showImport = false;

        public boolean isShowImport()
        {
            return _showImport;
        }

        public void setShowImport(boolean showImport)
        {
            _showImport = showImport;
        }
    }

    @RequiresPermission(ReadPermission.class)
    @CSRF
    public class GetDemographicsAction extends ApiAction<GetDemographicsForm>
    {
        public ApiResponse execute(GetDemographicsForm form, BindException errors) throws Exception
        {
            Map<String, Object> props = new HashMap<>();

            if (form.getIds() == null || form.getIds().length == 0)
            {
                errors.reject(ERROR_MSG, "No Ids Provided");
                return null;
            }

            try
            {
                JSONObject json = new JSONObject();
                for (AnimalRecord r : EHRDemographicsServiceImpl.get().getAnimals(getContainer(), Arrays.asList(form.getIds())))
                {
                    json.put(r.getId(), r.getProps());
                }

                props.put("results", json);
            }
            catch (Exception e)
            {
                ExceptionUtil.logExceptionToMothership(getViewContext().getRequest(), e);
                throw e;
            }

            return new ApiSimpleResponse(props);
        }
    }

    public static class GetDemographicsForm
    {
        private String[] _ids;

        public String[] getIds()
        {
            return _ids;
        }

        public void setIds(String[] ids)
        {
            _ids = ids;
        }
    }
    @RequiresPermission(AdminPermission.class)
    @CSRF
    public class SetGeneticCalculationTaskSettingsAction extends ApiAction<ScheduleGeneticCalculationForm>
    {
        public ApiResponse execute(ScheduleGeneticCalculationForm form, BindException errors)
        {
            Container c;
            if (form.getContainerPath() == null)
                c = getContainer();
            else
                c = ContainerManager.getForPath(form.getContainerPath());

            if (c == null)
            {
                errors.reject(ERROR_MSG, "Unable to find container for path: " + form.getContainerPath());
                return null;
            }
            GeneticCalculationsJob.setProperties(form.isEnabled(), c, form.getHourOfDay());

            return new ApiSimpleResponse("success", true);
        }
    }

    @RequiresPermission(AdminPermission.class)
    @CSRF
    public class SetRecordDeleteSettingsAction extends ApiAction<RecordDeleteForm>
    {
        public ApiResponse execute(RecordDeleteForm form, BindException errors)
        {
            RecordDeleteRunner.setProperties(getContainer(), form.isEnabled());

            return new ApiSimpleResponse("success", true);
        }
    }

    @RequiresPermission(ReadPermission.class)
    @CSRF
    public class GetAnimalDetailsAction extends ApiAction<AnimalDetailsForm>
    {
        public ApiResponse execute(AnimalDetailsForm form, BindException errors)
        {
            Map<String, Object> props = new HashMap<String, Object>();
            Set<String> sources = new HashSet<String>();
            if (form.isIncludeAssignment())
                sources.add("assignment");
            if (form.isIncludeFlags())
                sources.add("flags");
            if (form.isIncludeTreatments())
                sources.add("treatments");

            EHRManager.get().getAnimalDetails(getUser(), getContainer(), form.getAnimalIds(), sources);

            return new ApiSimpleResponse(props);
        }
    }

    public static class AnimalDetailsForm
    {
        private String[] _animalIds;
        private boolean _includeAssignment;
        private boolean _includeTreatments;
        private boolean _includeFlags;

        public String[] getAnimalIds()
        {
            return _animalIds;
        }

        public void setAnimalIds(String[] animalIds)
        {
            _animalIds = animalIds;
        }

        public boolean isIncludeAssignment()
        {
            return _includeAssignment;
        }

        public void setIncludeAssignment(boolean includeAssignment)
        {
            _includeAssignment = includeAssignment;
        }

        public boolean isIncludeTreatments()
        {
            return _includeTreatments;
        }

        public void setIncludeTreatments(boolean includeTreatments)
        {
            _includeTreatments = includeTreatments;
        }

        public boolean isIncludeFlags()
        {
            return _includeFlags;
        }

        public void setIncludeFlags(boolean includeFlags)
        {
            _includeFlags = includeFlags;
        }
    }

    @RequiresPermission(AdminPermission.class)
    @CSRF
    public class GetGeneticCalculationTaskSettingsAction extends ApiAction<ScheduleGeneticCalculationForm>
    {
        public ApiResponse execute(ScheduleGeneticCalculationForm form, BindException errors)
        {
            Map<String, Object> ret = new HashMap<>();

            Container c  = GeneticCalculationsJob.getContainer();
            if (c != null)
                ret.put("containerPath", c.getPath());

            ret.put("isScheduled", GeneticCalculationsJob.isScheduled());
            ret.put("enabled", GeneticCalculationsJob.isEnabled());
            ret.put("hourOfDay", GeneticCalculationsJob.getHourOfDay());

            return new ApiSimpleResponse(ret);
        }
    }

    @RequiresPermission(AdminPermission.class)
    @CSRF
    public class GetRecordDeleteSettingsAction extends ApiAction<Object>
    {
        public ApiResponse execute(Object form, BindException errors)
        {
            Map<String, Object> ret = new HashMap<>();

            ret.put("enabled", RecordDeleteRunner.isEnabled(getContainer()));

            return new ApiSimpleResponse(ret);
        }
    }

    public static class ScheduleGeneticCalculationForm
    {
        private boolean _enabled;
        private String containerPath;
        private int hourOfDay;

        public boolean isEnabled()
        {
            return _enabled;
        }

        public void setEnabled(boolean enabled)
        {
            _enabled = enabled;
        }

        public String getContainerPath()
        {
            return containerPath;
        }

        public void setContainerPath(String containerPath)
        {
            this.containerPath = containerPath;
        }

        public int getHourOfDay()
        {
            return hourOfDay;
        }

        public void setHourOfDay(int hourOfDay)
        {
            this.hourOfDay = hourOfDay;
        }
    }

    public static class RecordDeleteForm
    {
        private boolean _enabled;
        private int hourOfDay;

        public boolean isEnabled()
        {
            return _enabled;
        }

        public void setEnabled(boolean enabled)
        {
            _enabled = enabled;
        }

        public int getHourOfDay()
        {
            return hourOfDay;
        }

        public void setHourOfDay(int hourOfDay)
        {
            this.hourOfDay = hourOfDay;
        }
    }

    @RequiresPermission(ReadPermission.class)
    @CSRF
    public class GetLabResultSummary extends ApiAction<LabResultSummaryForm>
    {
        public ApiResponse execute(LabResultSummaryForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            if (form.getRunId() == null || form.getRunId().length == 0)
            {
                errors.reject(ERROR_MSG, "No Run Ids Provided");
                return null;
            }

            Map<String, List<String>> results = LabworkManager.get().getResults(getContainer(), getUser(), Arrays.asList(form.getRunId()), false);
            resultProperties.put("results", results);
            resultProperties.put("success", true);

            return new ApiSimpleResponse(resultProperties);
        }
    }

    public static class LabResultSummaryForm
    {
        String[] _runId;

        public String[] getRunId()
        {
            return _runId;
        }

        public void setRunId(String[] runId)
        {
            _runId = runId;
        }
    }

    @RequiresPermission(ReadPermission.class)
    //TODO: should enable @CSRF if we have SSRS updated to pass token.
    public class GetClinicalHistoryAction extends ApiAction<HistoryForm>
    {
        public ApiResponse execute(HistoryForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            if (form.getSubjectIds() == null || form.getSubjectIds().length == 0)
            {
                errors.reject(ERROR_MSG, "Must provide at least one subject Id");
                return null;
            }

            try
            {
                JSONArray results = new JSONArray();
                for (String subjectId : form.getSubjectIds())
                {
                    List<HistoryRow> rows = ClinicalHistoryManager.get().getHistory(getContainer(), getUser(), subjectId, form.getMinDate(), form.getMaxDate(), form.isRedacted());
                    for (HistoryRow row : rows)
                    {
                        results.put(row.toJSON());
                    }
                }

                resultProperties.put("success", true);
                resultProperties.put("results", results);

                if (form.isIncludeDistinctTypes())
                    resultProperties.put("distinctTypes", ClinicalHistoryManager.get().getTypes(getContainer(), getUser()));

                return new ApiSimpleResponse(resultProperties);
            }
            catch (IllegalArgumentException e)
            {
                ExceptionUtil.logExceptionToMothership(getViewContext().getRequest(), e);

                errors.reject(ERROR_MSG, e.getMessage());
                return null;
            }
        }
    }

    @RequiresPermission(ReadPermission.class)
    @CSRF
    public class GetCaseHistoryAction extends ApiAction<HistoryForm>
    {
        public ApiResponse execute(HistoryForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            if (form.getCaseId() == null || form.getSubjectIds() == null || form.getSubjectIds().length != 1)
            {
                errors.reject(ERROR_MSG, "Must provide a caseId and one subjectId");
                return null;
            }

            try
            {
                String subjectId = form.getSubjectIds()[0];
                JSONArray results = new JSONArray();
                List<HistoryRow> rows = ClinicalHistoryManager.get().getHistory(getContainer(), getUser(), subjectId, form.getCaseId(), form.isRedacted());
                for (HistoryRow row : rows)
                {
                    results.put(row.toJSON());
                }

                resultProperties.put("success", true);
                resultProperties.put("results", results);
                return new ApiSimpleResponse(resultProperties);
            }
            catch (IllegalArgumentException e)
            {
                ExceptionUtil.logExceptionToMothership(getViewContext().getRequest(), e);

                errors.reject(ERROR_MSG, e.getMessage());
                return null;
            }
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class EnsureDatasetPropertiesAction extends ConfirmAction<EnsureDatasetPropertiesForm>
    {
        public void validateCommand(EnsureDatasetPropertiesForm form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(EnsureDatasetPropertiesForm form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getConfirmView(EnsureDatasetPropertiesForm form, BindException errors) throws Exception
        {
            StringBuilder msg = new StringBuilder();
            msg.append("The EHR expects certain columns to be present on all datasets.  The following changes will be made:<br><br>");

            List<String> messages = EHRManager.get().ensureDatasetPropertyDescriptors(getContainer(),  getUser(), false, form.isRebuildIndexes());
            for (String message : messages)
            {
                msg.append("\t").append(message).append("<br>");
            }

            if (messages.size() > 0)
                msg.append("<br>Do you want to make these changes?");
            else
                msg.append("There are no changes to be made");

            return new HtmlView(msg.toString());
        }

        public boolean handlePost(EnsureDatasetPropertiesForm form, BindException errors) throws Exception
        {
            List<String> messages = EHRManager.get().ensureDatasetPropertyDescriptors(getContainer(),  getUser(), true, form.isRebuildIndexes());
            return true;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class EnsureEHRSchemaIndexesAction extends ConfirmAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getConfirmView(Object form, BindException errors) throws Exception
        {
            if (!getUser().isSiteAdmin())
            {
                throw new UnauthorizedException("Only site admins can view this page");
            }

            return new HtmlView("Several of the EHR schema tables can contain a large number of records.  Indexes are created by the SQL scripts; however, they are not automatically compressed.  This action will switch row compression on for these indexes.  It will only work for SQLServer.  Do you want to continue?");
        }

        public boolean handlePost(Object form, BindException errors) throws Exception
        {
            EHRManager.get().compressEHRSchemaIndexes();
            return true;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class EnsureQcStatesAction extends ConfirmAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getConfirmView(Object form, BindException errors) throws Exception
        {
            StringBuilder msg = new StringBuilder();
            msg.append("The EHR expects certain QCStates to exist in the study.  The following QCStates will be added:<br><br>");

            List<String> messages = EHRManager.get().ensureStudyQCStates(getContainer(),  getUser(), false);
            for (String message : messages)
            {
                msg.append("\t").append(message).append("<br>");
            }

            if (messages.size() > 0)
                msg.append("<br>Do you want to make these changes?");
            else
                msg.append("There are no changes to be made");

            return new HtmlView(msg.toString());
        }

        public boolean handlePost(Object form, BindException errors) throws Exception
        {
            List<String> messages = EHRManager.get().ensureStudyQCStates(getContainer(),  getUser(), true);
            return true;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class VerifyDatasetResourcesAction extends SimpleViewAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getView(Object form, BindException errors) throws Exception
        {
            StringBuilder msg = new StringBuilder();
            msg.append("For each dataset, we expect to find a trigger script and .query.xml file.  The following datasets lack one or more of these:<br><br>");

            List<String> messages = EHRManager.get().verifyDatasetResources(getContainer(), getUser());
            for (String message : messages)
            {
                msg.append("\t").append(message).append("<br>");
            }

            if (messages.size() == 0)
                msg.append("There are no missing files");

            return new HtmlView(msg.toString());
        }

        public NavTree appendNavTrail(NavTree tree)
        {
            return tree.addChild("Dataset Validation");

        }
    }

    public static class EnsureDatasetPropertiesForm
    {
        boolean commitChanges = false;
        boolean rebuildIndexes = false;

        public void setCommitChanges(boolean commitChanges)
        {
            this.commitChanges = commitChanges;
        }

        public boolean isCommitChanges()
        {
            return commitChanges;
        }

        public boolean isRebuildIndexes()
        {
            return rebuildIndexes;
        }

        public void setRebuildIndexes(boolean rebuildIndexes)
        {
            this.rebuildIndexes = rebuildIndexes;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class DoGeneticCalculationsAction extends ConfirmAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return PageFlowUtil.urlProvider(PipelineStatusUrls.class).urlBegin(getContainer());
        }

        public ModelAndView getConfirmView(Object form, BindException errors) throws Exception
        {
            return new HtmlView("This will cause the system to recalculate kinship and inbreeding coefficients on the colony.  Do you want to continue?");
        }

        public boolean handlePost(Object form, BindException errors) throws Exception
        {
            return new GeneticCalculationsRunnable().run(getContainer(), true);
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class DeletedRecordsRunnerAction extends ConfirmAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getConfirmView(Object form, BindException errors) throws Exception
        {
            return new HtmlView("This will cause the system to scan all datasets for records flagged as either Delete: Requested, or Cancelled or Denied Requests and permanently delete these records.  Do you want to continue?");
        }

        public boolean handlePost(Object form, BindException errors) throws Exception
        {
            new RecordDeleteRunner().run(getContainer());

            return true;
        }
    }

    public static class HistoryForm
    {
        private String _parentId;
        private String _runId;
        private String _caseId;

        private String[] _subjectIds;
        private Date _minDate;
        private Date _maxDate;
        private boolean _redacted = false;
        private boolean _includeDistinctTypes = false;

        public String getParentId()
        {
            return _parentId;
        }

        public void setParentId(String parentId)
        {
            _parentId = parentId;
        }

        public String getRunId()
        {
            return _runId;
        }

        public void setRunId(String runId)
        {
            _runId = runId;
        }

        public String getCaseId()
        {
            return _caseId;
        }

        public void setCaseId(String caseId)
        {
            _caseId = caseId;
        }

        public String[] getSubjectIds()
        {
            return _subjectIds;
        }

        public void setSubjectIds(String[] subjectIds)
        {
            _subjectIds = subjectIds;
        }

        public Date getMinDate()
        {
            return _minDate;
        }

        public void setMinDate(Date minDate)
        {
            _minDate = minDate;
        }

        public Date getMaxDate()
        {
            return _maxDate;
        }

        public void setMaxDate(Date maxDate)
        {
            _maxDate = maxDate;
        }

        public boolean isRedacted()
        {
            return _redacted;
        }

        public void setRedacted(boolean redacted)
        {
            _redacted = redacted;
        }

        public boolean isIncludeDistinctTypes()
        {
            return _includeDistinctTypes;
        }

        public void setIncludeDistinctTypes(boolean includeDistinctTypes)
        {
            _includeDistinctTypes = includeDistinctTypes;
        }
    }

    @RequiresPermission(ReadPermission.class)
    @CSRF
    public class GetReportLinksAction extends ApiAction<ReportLinkForm>
    {
        public ApiResponse execute(ReportLinkForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            List<Map<String, Object>> ret = new ArrayList<>();

            if (form.getLinkTypes() == null)
            {
                errors.reject(ERROR_MSG, "No link types specified");
                return null;
            }

            for (String linkType : form.getLinkTypes())
            {
                try
                {
                    EHRService.REPORT_LINK_TYPE type = EHRService.REPORT_LINK_TYPE.valueOf(linkType);

                    List<EHRServiceImpl.ReportLink> items = EHRServiceImpl.get().getReportLinks(getContainer(), getUser(), type);
                    for (EHRServiceImpl.ReportLink link : items)
                    {
                        JSONObject item = link.toJSON(getContainer());
                        item.put("type", type.name());
                        ret.add(item);
                    }
                }
                catch (IllegalArgumentException e)
                {
                    errors.reject(ERROR_MSG, "Invalid link type: " + linkType);
                    return null;
                }
            }

            resultProperties.put("items", ret);
            return new ApiSimpleResponse(resultProperties);
        }
    }

    public static class ReportLinkForm
    {
        private String[] _linkTypes;

        public String[] getLinkTypes()
        {
            return _linkTypes;
        }

        public void setLinkTypes(String[] linkTypes)
        {
            _linkTypes = linkTypes;
        }
    }

    @RequiresPermission(ReadPermission.class)
    @CSRF
    public class GetDataEntryFormDetailsAction extends ApiAction<EnterDataForm>
    {
        public ApiResponse execute(EnterDataForm form, BindException errors)
        {
            Map<String, Object> props = new HashMap<String, Object>();

            if (form.getFormType() == null && form.getTaskId() == null && form.getRequestId() == null)
            {
                errors.reject(ERROR_MSG, "Must provide either the form type, taskId or requestId");
                return null;
            }

            String formType = form.getFormType();
            if (formType == null && form.getTaskId() != null)
            {
                formType = EHRManager.get().getFormTypeForTask(getContainer(), getUser(), form.getTaskId());
            }

            if (formType == null && form.getRequestId() != null)
            {
                formType = EHRManager.get().getFormTypeForRequest(getContainer(), getUser(), form.getRequestId());
            }

            if (formType == null)
            {
                errors.reject(ERROR_MSG, "Unable to find formType for task: " + form.getTaskId());
                return null;
            }

            DataEntryForm def = DataEntryManager.get().getFormByName(form.getFormType(), getContainer(), getUser());
            if (def == null)
            {
                errors.reject(ERROR_MSG, "Unknown form type: " + form.getFormType());
                return null;
            }

            if (!def.canRead())
            {
                props.put("success", false);
                props.put("canRead", false);
            }
            else
            {
                props.put("success", true);
                props.put("canRead", true);
                props.put("form", def.toJSON());
            }

            return new ApiSimpleResponse(props);
        }
    }

    @RequiresPermission(EHRDataEntryPermission.class)
    public class DataEntryFormAction extends SimpleViewAction<EnterDataForm>
    {
        private String _title = null;

        @Override
        public ModelAndView getView(EnterDataForm form, BindException errors) throws Exception
        {
            if (form.getFormType() == null)
            {
                errors.reject(ERROR_MSG, "Must provide either the form type");
                return null;
            }

            DataEntryForm def = DataEntryManager.get().getFormByName(form.getFormType(), getContainer(), getUser());
            if (def == null)
            {
                errors.reject(ERROR_MSG, "Unknown form type: " + form.getFormType());
                return new SimpleErrorView(errors);
            }

            _title = def.getLabel();

            JspView<DataEntryForm> view = new JspView<>("/org/labkey/ehr/view/dataEntryForm.jsp", def);
            view.setTitle(def.getLabel());
            view.setHidePageTitle(true);
            view.setFrame(WebPartView.FrameType.PORTAL);

            view.addClientDependency(ClientDependency.fromPath("ehr/ehr_ext4_dataEntry"));
            view.addClientDependencies(def.getClientDependencies());

            return view;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return root.addChild(_title == null ? "Enter Data" : _title);
        }
    }

    @RequiresPermission(EHRDataEntryPermission.class)
    public class DataEntryFormForQueryAction extends SimpleViewAction<EnterDataForm>
    {
        private String _title = null;

        @Override
        public ModelAndView getView(EnterDataForm form, BindException errors) throws Exception
        {
            if (form.getQueryName() == null || form.getSchemaName() == null)
            {
                errors.reject(ERROR_MSG, "Must provide either the schema/query");
                return null;
            }

            DataEntryForm def = DataEntryManager.get().getFormForQuery(form.getSchemaName(), form.getQueryName(), getContainer(), getUser());
            if (def == null)
            {
                errors.reject(ERROR_MSG, "Unable to create form for query: " + form.getSchemaName() + "." + form.getQueryName());
                return new SimpleErrorView(errors);
            }

            _title = def.getLabel();

            JspView<DataEntryForm> view = new JspView<>("/org/labkey/ehr/view/dataEntryForm.jsp", def);
            view.setTitle(def.getLabel());
            view.setHidePageTitle(true);
            view.setFrame(WebPartView.FrameType.PORTAL);

            view.addClientDependency(ClientDependency.fromPath("ehr/ehr_ext4_dataEntry"));
            view.addClientDependencies(def.getClientDependencies());

            return view;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return root.addChild(_title == null ? "Enter Data" : _title);
        }
    }

    @RequiresPermission(EHRDataEntryPermission.class)
    @CSRF
    public class DataEntryFormJsonForQueryAction extends ApiAction<EnterDataForm>
    {
        @Override
        public ApiResponse execute(EnterDataForm form, BindException errors)
        {
            if (form.getQueryName() == null || form.getSchemaName() == null)
            {
                errors.reject(ERROR_MSG, "Must provide either the schema/query");
                return null;
            }

            DataEntryForm def = DataEntryManager.get().getFormForQuery(form.getSchemaName(), form.getQueryName(), getContainer(), getUser());
            if (def == null)
            {
                errors.reject(ERROR_MSG, "Unable to create form for query: " + form.getSchemaName() + "." + form.getQueryName());
                return null;
            }

            JSONObject ret = new JSONObject();
            ret.put("formConfig", def.toJSON());

            LinkedHashSet<String> jsDependencyPaths = new LinkedHashSet<>();
            LinkedHashSet<String> cssDependencyPaths = new LinkedHashSet<>();

            LinkedHashSet<ClientDependency> dependencies = new LinkedHashSet<>();
            dependencies.add(ClientDependency.fromPath("ehr/ehr_ext4_dataEntry"));
            dependencies.addAll(def.getClientDependencies());
            for (ClientDependency cd : dependencies)
            {
                jsDependencyPaths.addAll(cd.getJsPaths(getContainer(), AppProps.getInstance().isDevMode()));
                cssDependencyPaths.addAll(cd.getCssPaths(getContainer()));
            }
            ret.put("jsDependencies", jsDependencyPaths);
            ret.put("cssDsDependencies", cssDependencyPaths);

            return new ApiSimpleResponse(ret);
        }

    }

    public static class EnterDataForm
    {
        private String _formType;
        private String _taskId;
        private String _requestId;

        private String _schemaName;
        private String _queryName;

        public String getFormType()
        {
            return _formType;
        }

        public void setFormType(String formType)
        {
            _formType = formType;
        }

        public String getTaskId()
        {
            return _taskId;
        }

        public void setTaskId(String taskId)
        {
            _taskId = taskId;
        }

        public String getRequestId()
        {
            return _requestId;
        }

        public void setRequestId(String requestId)
        {
            _requestId = requestId;
        }

        public String getSchemaName()
        {
            return _schemaName;
        }

        public void setSchemaName(String schemaName)
        {
            _schemaName = schemaName;
        }

        public String getQueryName()
        {
            return _queryName;
        }

        public void setQueryName(String queryName)
        {
            _queryName = queryName;
        }
    }

    @RequiresPermission(UpdatePermission.class)
    @CSRF
    public class ManageFlagsAction extends ApiAction<ManageFlagsForm>
    {
        public ApiResponse execute(ManageFlagsForm form, BindException errors) throws Exception
        {
            Map<String, Object> resp = new HashMap<>();

            if (form.getFlag() == null)
            {
                errors.reject(ERROR_MSG, "No flag supplied");
                return null;
            }

            if (form.getAnimalIds() == null || form.getAnimalIds().length == 0)
            {
                errors.reject(ERROR_MSG, "No animal IDs supplied");
                return null;
            }

            try
            {
                String mode = form.getMode();
                if ("add".equalsIgnoreCase(mode))
                {
                    if (form.getDate() == null)
                    {
                        errors.reject(ERROR_MSG, "Must supply a date");
                        return null;
                    }

                    Collection<String> added = EHRManager.get().ensureFlagActive(getUser(), getContainer(), form.getFlag(), form.getDate(), null, form.getRemark(), Arrays.asList(form.getAnimalIds()), form.getLivingAnimalsOnly());
                    resp.put("added", added);
                }
                else if ("remove".equalsIgnoreCase(mode))
                {
                    if (form.getEnddate() == null)
                    {
                        errors.reject(ERROR_MSG, "Must supply an end date");
                        return null;
                    }

                    Collection<String> removed = EHRManager.get().terminateFlagsIfExists(getUser(), getContainer(), form.getFlag(), form.getEnddate(), Arrays.asList(form.getAnimalIds()));
                    resp.put("removed", removed);
                }
                else
                {
                    errors.reject(ERROR_MSG, "Unknown mode, must either be add or remove");
                    return null;
                }

                resp.put("success", true);
            }
            catch (IllegalArgumentException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
                return null;
            }
            catch (BatchValidationException e)
            {
                List<String> errs = new ArrayList<>();
                for (ValidationException ve : e.getRowErrors())
                {
                    for (ValidationError v : ve.getErrors())
                    {
                        errs.add(v.getMessage());
                    }
                }
                errors.reject(ERROR_MSG, StringUtils.join(errs, ";\n"));
                return null;
            }

            return new ApiSimpleResponse(resp);
        }
    }

    public static class ManageFlagsForm
    {
        private String _flag;
        private Date _date;
        private Date _enddate;
        private String _remark;
        private String[] _animalIds;
        private String _mode;
        private Boolean _livingAnimalsOnly = true;

        public String getFlag()
        {
            return _flag;
        }

        public void setFlag(String flag)
        {
            _flag = flag;
        }

        public Date getDate()
        {
            return _date;
        }

        public void setDate(Date date)
        {
            _date = date;
        }

        public Date getEnddate()
        {
            return _enddate;
        }

        public void setEnddate(Date enddate)
        {
            _enddate = enddate;
        }

        public String getRemark()
        {
            return _remark;
        }

        public void setRemark(String remark)
        {
            _remark = remark;
        }

        public String[] getAnimalIds()
        {
            return _animalIds;
        }

        public void setAnimalIds(String[] animalIds)
        {
            _animalIds = animalIds;
        }

        public String getMode()
        {
            return _mode;
        }

        public void setMode(String mode)
        {
            _mode = mode;
        }

        public Boolean getLivingAnimalsOnly()
        {
            return _livingAnimalsOnly;
        }

        public void setLivingAnimalsOnly(Boolean livingAnimalsOnly)
        {
            _livingAnimalsOnly = livingAnimalsOnly;
        }
    }

    public static class IdForm
    {
        private String _ids;
        private int _interval;

        public String getIds() {return _ids;}

        public void setIds(String id) {_ids = id;}

        public int getInterval()
        {
            return _interval;
        }

        public void setInterval(int interval)
        {
            _interval = interval;
        }

        public List<String> getIdList()
        {
            List<String> list = new ArrayList<>();
            String[] ids = _ids.split(",");
            for(String id : ids)
                list.add(id);

            return list;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class BloodPlotDataAction extends ApiAction<IdForm>
    {

        @Override
        public ApiResponse execute(IdForm idForm, BindException errors) throws Exception
        {
            ApiSimpleResponse response = new ApiSimpleResponse();

            UserSchema schema = QueryService.get().getUserSchema(getUser(), getContainer(), "study");
            TableInfo bloodDrawsTable = schema.getTable("currentBloodDraws");

            SimpleFilter filter = new SimpleFilter();
            filter.addCondition(FieldKey.fromParts("id"), idForm.getIdList(), CompareType.IN);

            TableSelector selector = new TableSelector(bloodDrawsTable, filter, null);

            Map<String, Object> params = new HashMap<>();
            params.put("DATE_INTERVAL", idForm.getInterval());
            selector.setNamedParameters(params);

            List<BloodPlotData> bloodData = selector.getArrayList(BloodPlotData.class);
            List<JSONObject> jsonData = new ArrayList<>();
            for (BloodPlotData data : bloodData)
            {
                jsonData.add(data.toJSON());
            }

            List<DisplayColumn> cols = new ArrayList<>();
            List<JSONObject> colModels = new ArrayList<>();
            for (ColumnInfo ci : bloodDrawsTable.getColumns())
            {
                DisplayColumn dc = new DataColumn(ci);
                if (ci.getJdbcType() == JdbcType.DATE || ci.getJdbcType() == JdbcType.TIMESTAMP)
                    dc.setFormatString("yyyy-MM-dd");

                colModels.add(new JSONObject(JsonWriter.getColModel(dc)));
                cols.add(dc);
            }

            JSONArray fields = new JSONArray(JsonWriter.getNativeColProps(cols, null, false).values());
            JSONArray columnModel = new JSONArray(colModels);
            JSONObject meta = new JSONObject().put("fields", fields).put("root", "rows");

            response.put("rows", jsonData);
            response.put("metaData", meta);
            response.put("rowCount", jsonData.size());
            response.put("columnModel", columnModel);

            return response;

        }
    }
}