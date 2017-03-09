package org.labkey.webutils;

import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.ActionNames;
import org.labkey.api.security.RequiresNoPermission;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.webutils.api.action.LegacyJspPageAction;
import org.labkey.webutils.api.action.SimpleJspPageAction;
import org.labkey.webutils.api.action.annotation.JspPath;
import org.labkey.webutils.api.action.annotation.PageTitle;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.Map;

public class WebUtilsController extends SpringActionController {
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WebUtilsController.class);
    public static final String NAME = "webutils";

    public WebUtilsController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction {
        public ModelAndView getView(Object o, BindException errors) throws Exception {
            return new JspView("/org/labkey/webutils/view/begin.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }

    public static class NullForm {}

    @RequiresNoPermission
    @ActionNames("loginStatus")
    public class getLoginStatus extends ApiAction<NullForm> {
        @Override
        public Object execute(NullForm nullForm, BindException errors) throws Exception {
            Map<String, Object> json = new HashMap<>();

            // Check to see if we're logged in as a guest.
            Boolean loggedIn = !(getUser() == User.guest);
            json.put("loggedIn", loggedIn);

            return new ApiSimpleResponse(json);
        }
    }

    public class WebUtilsJspPageAction extends LegacyJspPageAction {
        @Override
        protected Class getBaseClass() {
            return WebUtilsController.class;
        }
    }

    @PageTitle("Test Page")
    @JspPath("view/TestPage.jsp")
    public class TestPageAction extends WebUtilsJspPageAction {}
}