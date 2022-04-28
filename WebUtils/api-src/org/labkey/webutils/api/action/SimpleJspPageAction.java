package org.labkey.webutils.api.action;

import org.labkey.api.view.JspView;

/**
 * Created by jon on 9/14/16.
 */
public abstract class SimpleJspPageAction extends JspPageAction
{
    @Override
    public JspView<?> getView()
    {
        String path = getPathToJsp();
        assert path.startsWith("/") && path.endsWith(".jsp") : "JSP paths must be absolute and end with .jsp";
        return new JspView<>(path, getModel());
    }

    // This is never overridden. TODO: Remove this method and switch to JspView(String jspPath) constructor above?
    public Object getModel() {
        return null;
    }

    /**
     * Returns an absolute path to the JSP, starting with "/org/labkey/..." and ending with ".jsp". Relative paths are
     * NOT supported.
     *
     * @return an absolute path to the JSP
     */
    public abstract String getPathToJsp();
}
