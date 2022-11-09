package org.labkey.wnprc_virology;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.labkey.api.action.FormHandlerAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.module.Module;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
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
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.sql.SQLException;
import java.util.ArrayList;
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
        private String _accountNumbers;

        public String getAccountNumbers()
        {
            return _accountNumbers;
        }

        public void setAccountNumbers(String accountNumbers)
        {
            _accountNumbers = accountNumbers;
        }
    }

    /* Add accounts and linked schema during folder setup */
    @RequiresPermission(ReadPermission.class)
    public static class FolderSetupAction extends FormHandlerAction<FolderSetupForm>
    {
        @Override
        public void validateCommand(FolderSetupForm target, Errors errors)
        {
        }

        @Override
        public boolean handlePost(FolderSetupForm folderSetupForm, BindException errors) throws SQLException, QueryUpdateServiceException, BatchValidationException, DuplicateKeyException
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
                return true; // no wnprc virology module found, do nothing
            }
            else
            {
                // insert folder name and account info into mapping table to filter data
                String accountNumbers = folderSetupForm.getAccountNumbers();
                String containerName = c.getName();
                String containerPath = virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PARENT_FOLDER_STRING_PROP).getEffectiveValue(ContainerManager.getRoot());
                if (containerPath == null)
                    containerPath = virologyModule.getModuleProperties().get(WNPRC_VirologyModule.RSEHR_PARENT_FOLDER_STRING_PROP).getDefaultValue();
                if (containerPath == null)
                {
                    _log.info("No container path found for RSEHR Viral Load Parent Folder. Configure it in the module settings.");
                    return true;
                }
                Container viralLoadContainer = ContainerManager.getForPath(containerPath);
                if (viralLoadContainer == null)
                {
                    _log.info("No container found for RSEHR Viral Load Parent Folder. Check the module properties.");
                    return true;
                }
                SimpleQueryUpdater qu = new SimpleQueryUpdater(getUser(), viralLoadContainer, "lists", "Create Folders");
                Map<String,Object> mp = new HashMap<>();
                mp.put("folderName", containerName);
                mp.put("accounts", accountNumbers);
                List<Map<String, Object>> rowsToInsert = new ArrayList<>();
                rowsToInsert.add(mp);
                qu.insert(rowsToInsert);

                // set up linked schema to filter data per lab
                String metadata = "<tables xmlns=\"http://labkey.org/data/xml\" xmlns:cv=\"http://labkey.org/data/xml/queryCustomView\">\n" +
                        "  <filters name=\"client-filter\">\n" +
                        "    <cv:filter column=\"folderName\" operator=\"eq\" value=\"" +
                        containerName +
                        "\"/>\n" +
                        "  </filters>\n" +
                        "  <table tableName=\"" +
                        _sourceDataTableName +
                        "\" tableDbType=\"NOT_IN_DB\">\n" +
                        "    <filters ref=\"client-filter\"/>\n" +
                        "  </table>\n" +
                        "</tables>";
                QueryService.get().createLinkedSchema(getUser(), c,containerName + "LinkedSchema", viralLoadContainer.getId(), "lists", metadata, _sourceDataTableName, null);
            }

            return true;
        }


        @Override
        public URLHelper getSuccessURL(FolderSetupForm folderSetupForm)
        {
            // have the user setup permissions after accounts setup
            ActionURL permsSetupUrl = new ActionURL("security", "permissions", getContainer());
            return permsSetupUrl;
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
