package org.labkey.enterweights;

import org.json.JSONObject;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleApiJsonForm;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

public class EnterWeightsController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(EnterWeightsController.class);
    public static final String NAME = "enterweights";

    public EnterWeightsController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresLogin
    public class BeginAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors)
        {
            return new JspView<>("/org/labkey/enterweights/view/begin.jsp");
        }
        public NavTree appendNavTrail(NavTree root){
            return root;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class AdminAction extends SimpleViewAction
    {

        @Override
        public ModelAndView getView(Object o, BindException errors)
        {
            return new JspView<>("/org/labkey/enterweights/view/begin.jsp");
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            ActionURL url = new ActionURL(true);
            url.setPath("enterweights-app.view");
            url.setContainer(getContainer());
            root.addChild("Enter Weights Home Page", url);
            return root;
        }
    }


    @RequiresPermission(AdminPermission.class)
    public class SaveWeightsAction extends MutatingApiAction<SimpleApiJsonForm>
    {
        @Override
        public ApiResponse execute(SimpleApiJsonForm form, BindException errors)
        {
            JSONObject json = form.getJsonObject();

            return new ApiSimpleResponse();
        }
    }
}
