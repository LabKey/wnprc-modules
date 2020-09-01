package org.labkey.animalrequests;

import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

public class AnimalRequestsController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(AnimalRequestsController.class);
    public static final String NAME = "animalrequests";

    public AnimalRequestsController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresLogin
    public class BeginAction extends SimpleViewAction
    {
        @Override
        public ModelAndView getView(Object o, BindException errors)
        {
            return new JspView<>("/org/labkey/animalrequests/view/begin.jsp");
        }
        public NavTree appendNavTrail(NavTree root){
            return root;
        }
    }

}
