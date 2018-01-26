package org.labkey.webutils.api.action;

import org.labkey.api.view.JspView;
import org.labkey.webutils.api.WebUtilsService;

/**
 * Created by jon on 9/14/16.
 */
public abstract class SimpleJspPageAction extends JspPageAction {
    @Override
    public JspView getView() {
        return new JspView(WebUtilsService.resolveJspPath(getPathToJsp(), getModule().getClass()), getModel());
    }

    public Object getModel() {
        return null;
    }

    /**
     * Returns a path (relative or absolute) to the JSP.
     *
     * By default, relative paths (ones that don't start with "/") are resolved relative module class that
     * registered the controller returned by getControllerName().
     *
     * @return a path to the JSP
     */
    public abstract String getPathToJsp();
}
