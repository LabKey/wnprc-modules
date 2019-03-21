package org.labkey.wnprc_ehr;

import com.google.common.base.Throwables;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.security.RequiresSiteAdmin;
import org.labkey.webutils.api.action.SimpleJspPageAction;
import org.labkey.wnprc_ehr.data.breeding.PregnancyHistoryCreator;
import org.springframework.validation.BindException;

import java.io.File;
import java.nio.file.Paths;

/**
 * Controller to hold testing and diagnostic utilities.
 * <p>
 * Created by jon on 9/14/16.
 */
public class WNPRC_EHRTestController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_EHRTestController.class);

    public WNPRC_EHRTestController()
    {
        setActionResolver(_actionResolver);
    }

    /**
     * Action definition for the import dataset test API action. Executes the import based on a pre-defined study
     * definition.
     */
    @RequiresSiteAdmin
    public static class ImportDatasetMetadataAction extends ApiAction<Void>
    {
        @Override
        public Object execute(Void aVoid, BindException errors) throws Exception
        {
            Module module = ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);
            assert module != null;

            File file = new File(Paths.get(module.getExplodedPath().getAbsolutePath(), "referenceStudy", "study").toFile(),
                    "study.xml");
            DatasetImportHelper.importDatasetMetadata(getUser(), getContainer(), file);
            return new ApiSimpleResponse("success", true);
        }
    }

    public abstract class WNPRCTestJspPageAction extends SimpleJspPageAction
    {
        @Override
        public Module getModule()
        {
            return ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class);
        }
    }

    @ActionNames("ExtComponents")
    @RequiresLogin()
    public class ExtComponentsAction extends WNPRCTestJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/testing/ext_component_tests.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Test - Ext Component";
        }
    }

    @ActionNames("TriggerTests")
    @RequiresLogin()
    public class TriggerTestsAction extends WNPRCTestJspPageAction
    {
        @Override
        public String getPathToJsp()
        {
            return "pages/testing/trigger_tests.jsp";
        }

        @Override
        public String getTitle()
        {
            return "Test - Trigger Tests";
        }
    }

    /**
     * Test action for generating pregnancy history from the existing data in the birth, prenatal, and
     * demographic datasets.
     */
    @RequiresSiteAdmin
    public class CreatePregnanciesAction extends ApiAction<Void>
    {
        @Override
        public Object execute(Void aVoid, BindException errors)
        {
            try
            {
                PregnancyHistoryCreator.createPregnanciesAndOutcomes(getUser(), getContainer());
                return new ApiSimpleResponse("success", true);
            }
            catch (Exception e)
            {
                return new ApiSimpleResponse("error", Throwables.getStackTraceAsString(e));
            }
        }
    }
}
