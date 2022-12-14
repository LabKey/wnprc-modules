package org.labkey.wnprc_virology;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.FormHandlerAction;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.module.Module;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.WebPartView;
import org.labkey.api.view.template.PageConfig;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.labkey.wnprc_virology.ViralLoadRSEHRRunner.virologyModule;


public class WNPRC_VirologyController extends SpringActionController
{
    public static final String CONFIGURE_VIROLOGY_FOLDER = "Configure WNPRC Virology Shared Data Folder";
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_VirologyController.class);
    public static final String NAME = "wnprc_virology";
    private static Logger _log = LogManager.getLogger(WNPRC_VirologyController.class);

    private static final String _sourceDataTableName = "viral_load_data_filtered";

    public WNPRC_VirologyController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            return new JspView("/org/labkey/wnprc_virology/view/hello.jsp");
        }

        @Override
        public void addNavTrail(NavTree root)
        {
        }
    }

    public static class FolderSetupForm
    {
        private int[] _accounts;

        public int[] getAccounts()
        {
            return _accounts;
        }

        public void setAccounts(int[] accounts)
        {
            _accounts = accounts;
        }
    }

    /* A function to insert/update accounts */
    public void upsertAccounts(Container viralLoadContainer, Container currentContainer, int[] accountNumbers) throws SQLException, QueryUpdateServiceException, BatchValidationException, DuplicateKeyException, InvalidKeyException
    {
        String schemaName = "wnprc_virology";
        String queryName = "folders_accounts_mappings";

        List<Map<String, Object>> rowsToInsert = new ArrayList<>();
        List<Map<String, Object>> rowsToDelete = new ArrayList<>();

        SimpleQueryFactory f = new SimpleQueryFactory(getUser(), viralLoadContainer);
        SimpleFilter filter = new SimpleFilter();
        filter.addCondition(FieldKey.fromString("folder_name"), currentContainer.getName());
        JSONArray ja = f.selectRows(schemaName, queryName, filter);

        List<Integer> accountsList = new ArrayList<>();
        for (int k = 0; k < accountNumbers.length; k ++)
        {
            accountsList.add(accountNumbers[k]);
        }

        SimpleQueryUpdater qu = new SimpleQueryUpdater(getUser(), viralLoadContainer, schemaName, queryName);

        if (accountsList.size() == 0)
        {
            for (int j = 0; j < ja.length(); j++)
            {
                JSONObject jo = (JSONObject) ja.get(j);
                Map<String,Object> mp = new HashMap<>();
                mp.put("folder_name", currentContainer.getName());
                mp.put("account", jo.get("account"));
                mp.put("rowid", jo.get("rowid"));
                rowsToDelete.add(mp);
            }
        } else if (ja.length() == 0)
        {
            for (int i = 0; i < accountsList.size(); i++)
            {
                Map<String,Object> mp = new HashMap<>();
                mp.put("folder_name", currentContainer.getName());
                mp.put("account", accountsList.get(i));
                rowsToInsert.add(mp);
            }
        } else if (accountsList.size() > 0 && ja.length() > 0)
        {

            for (int t = 0; t < ja.length(); t++)
            {
                JSONObject jo = (JSONObject) ja.get(t);
                boolean neverFound = true;
                for (int h = 0; h < accountsList.size(); h++)
                {
                    if (accountsList.get(h).equals(jo.get("account")))
                    {
                        neverFound = false;
                        accountsList.remove((Integer) jo.get("account"));
                    }
                }
                if (neverFound)
                {
                    Map<String,Object> mp = new HashMap<>();
                    mp.put("folder_name", currentContainer.getName());
                    mp.put("account", jo.get("account"));
                    mp.put("rowid", jo.get("rowid"));
                    rowsToDelete.add(mp);
                }
            }
            for (int g = 0; g < accountsList.size(); g++)
            {
                Map<String,Object> mp = new HashMap<>();
                mp.put("folder_name", currentContainer.getName());
                mp.put("account", accountsList.get(g));
                rowsToInsert.add(mp);
            }

        }
        if (!rowsToInsert.isEmpty())
            qu.insert(rowsToInsert);
        if (!rowsToDelete.isEmpty())
            qu.delete(rowsToDelete);

    }

    /* An action to update accounts without folder setup */
    @RequiresPermission(ReadPermission.class)
    public class updateAccountsAction extends MutatingApiAction<FolderSetupForm>
    {
        @Override
        public ApiResponse execute(FolderSetupForm folderSetupForm, BindException errors) throws SQLException, QueryUpdateServiceException, BatchValidationException, DuplicateKeyException, InvalidKeyException
        {
            Container vlc = getViralLoadDataContainer();
            upsertAccounts(vlc, getContainer(), folderSetupForm.getAccounts());
            return new ApiSimpleResponse("success", true);
        }
    }

    public Container getViralLoadDataContainer()
    {
        String containerPath = virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PARENT_FOLDER_STRING_PROP).getEffectiveValue(ContainerManager.getRoot());
        if (containerPath == null)
            containerPath = virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PARENT_FOLDER_STRING_PROP).getDefaultValue();
        if (containerPath == null)
        {
            _log.info("No container path found for RSEHR Viral Load Parent Folder. Configure it in the module settings.");
            return null;
        }
        return ContainerManager.getForPath(containerPath);
    }

    /* Add accounts and linked schema during folder setup */
    @RequiresPermission(ReadPermission.class)
    public class FolderSetupAction extends MutatingApiAction<FolderSetupForm>
    {
        @Override
        public ApiResponse execute(FolderSetupForm folderSetupForm, BindException errors) throws SQLException, QueryUpdateServiceException, BatchValidationException, DuplicateKeyException, InvalidKeyException
        {
            Container c = getContainer();
            WNPRC_VirologyModule wnprcVirologyModule = null;
            for (Module m : c.getActiveModules())
            {
                if (m instanceof WNPRC_VirologyModule)
                {
                    wnprcVirologyModule = (WNPRC_VirologyModule) m;
                }
            }
            if (wnprcVirologyModule == null)
            {
                Map<String, Object> result = new HashMap<>();
                result.put("failure", true);
                return new ApiSimpleResponse(result);
            }
            else
            {
                // insert folder name and account info into mapping table to filter data
                int[] accountNumbers = folderSetupForm.getAccounts();
                String containerName = c.getName();
                Container viralLoadContainer = getViralLoadDataContainer();
                if (viralLoadContainer == null)
                {
                    _log.info("No container found for RSEHR Viral Load Parent Folder. Check the module properties.");
                    Map<String, Object> result = new HashMap<>();
                    result.put("failure", true);
                    return new ApiSimpleResponse(result);
                }
                if (accountNumbers != null) {
                    upsertAccounts(viralLoadContainer, c, accountNumbers);
                }

                // set up linked schema to filter data per lab
                String metadata = "<tables xmlns=\"http://labkey.org/data/xml\" xmlns:cv=\"http://labkey.org/data/xml/queryCustomView\">\n" +
                        "  <filters name=\"client-filter\">\n" +
                        "    <cv:filter column=\"folder_name\" operator=\"eq\" value=\"" +
                        containerName +
                        "\"/>\n" +
                        "  </filters>\n" +
                        "  <table tableName=\"" +
                        _sourceDataTableName +
                        "\" tableDbType=\"NOT_IN_DB\">\n" +
                        "    <filters ref=\"client-filter\"/>\n" +
                        "       <columns>\n" +
                        "          <column columnName=\"account\">\n" +
                        "             <fk>\n" +
                        "                <fkDbSchema>wnprc_virology_linked</fkDbSchema>\n" +
                        "                <fkTable>grant_accounts</fkTable>\n" +
                        "                <fkColumnName>rowid_etl</fkColumnName>\n" +
                        "                <fkDisplayColumnName>alias</fkDisplayColumnName>\n" +
                        "             </fk>\n" +
                        "          </column>\n" +
                        "       </columns>" +
                        "  </table>\n" +
                        "</tables>";
                QueryService.get().createLinkedSchema(getUser(), c,containerName + "LinkedSchema", viralLoadContainer.getId(), "lists", metadata, _sourceDataTableName, null);

            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            return new ApiSimpleResponse(result);
        }


    }

    @RequiresPermission(AdminPermission.class)
    public static class StartRSEHRJobAction extends MutatingApiAction<Object>
    {

        @Override
        public Object execute(Object o, BindException errors) throws Exception
        {

            JobDetail _job = null;
            _job = JobBuilder.newJob(ViralLoadRSEHRRunner.class)
                    .withIdentity(ViralLoadRSEHRRunner.class.getCanonicalName())
                    .build();
            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(ViralLoadRSEHRRunner.class.getCanonicalName())
                    .startNow()
                    .forJob(_job)
                    .build();
            StdSchedulerFactory.getDefaultScheduler().scheduleJob(_job, trigger);
            return null;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public static class LinkedSchemaSetupAction extends MutatingApiAction<Object>
    {
        @Override
        public Object execute(Object o, BindException errors) throws Exception
        {
            String containerPath = virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PARENT_FOLDER_STRING_PROP).getEffectiveValue(ContainerManager.getRoot());
            if (containerPath == null)
                containerPath = virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PARENT_FOLDER_STRING_PROP).getDefaultValue();
            if (containerPath == null)
            {
                _log.info("No container path found for RSEHR Viral Load Parent Folder. Configure it in the module settings.");
                return true;
            }
            Container viralLoadContainer = ContainerManager.getForPath(containerPath);
            Container c = getContainer();
            QueryService.get().createLinkedSchema(getUser(), c, "wnprc_virology_linked", viralLoadContainer.getId(), "wnprc_virology", null, "grant_accounts, folders_accounts_mappings", null);
            return null;
        }

    }
    @RequiresPermission(AdminPermission.class)
    public static class SetupAction extends SimpleViewAction<Object>
    {
        @Override
        public ModelAndView getView(Object o, BindException errors)
        {
            JspView<?> view = new JspView<>("/org/labkey/wnprc_virology/view/folderSetup.jsp");
            view.setFrame(WebPartView.FrameType.NONE);

            getPageConfig().setNavTrail(ContainerManager.getCreateContainerWizardSteps(getContainer(), getContainer().getParent()));
            getPageConfig().setTemplate(PageConfig.Template.Wizard);
            getPageConfig().setTitle(CONFIGURE_VIROLOGY_FOLDER);

            return view;
        }

        @Override
        public void addNavTrail(NavTree root)
        {
        }
    }

}
