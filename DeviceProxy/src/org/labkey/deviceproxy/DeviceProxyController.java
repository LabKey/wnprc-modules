package org.labkey.deviceproxy;

import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

public class DeviceProxyController extends SpringActionController {
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(DeviceProxyController.class);
    public static final String NAME = "deviceproxy";

    public DeviceProxyController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction {
        public ModelAndView getView(Object o, BindException errors) throws Exception {
            return new JspView("/org/labkey/deviceproxy/view/hello.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }
}