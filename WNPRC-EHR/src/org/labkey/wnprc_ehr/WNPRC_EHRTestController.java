package org.labkey.wnprc_ehr;

import org.labkey.api.action.SpringActionController;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.RequiresLogin;
import org.labkey.webutils.api.action.SimpleJspPageAction;

/**
 * Controller to hold testing and diagnostic utilities.
 *
 * Created by jon on 9/14/16.
 */
public class WNPRC_EHRTestController extends SpringActionController {
    public static String NAME = "wnprc_test";

    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_EHRTestController.class);

    public WNPRC_EHRTestController() {
        setActionResolver(_actionResolver);
    }

    public abstract class WNPRCTestJspPageAction extends SimpleJspPageAction {
        @Override
        public Class getBaseClass() {
            return WNPRC_EHRModule.class;
        }
    }

    @ActionNames("ExtComponents")
    @RequiresLogin()
    public class ExtComponentsAction extends WNPRCTestJspPageAction {
        @Override
        public String getPathToJsp() {
            return "pages/testing/ext_component_tests.jsp";
        }

        @Override
        public String getTitle() {
            return "Test - Ext Component";
        }
    }

    @ActionNames("TriggerTests")
    @RequiresLogin()
    public class TriggerTestsAction extends WNPRCTestJspPageAction {
        @Override
        public String getPathToJsp() {
            return "pages/testing/trigger_tests.jsp";
        }

        @Override
        public String getTitle() {
            return "Test - Trigger Tests";
        }
    }
}
