package org.labkey.webutils.api.action;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.view.JspView;

/**
 * Created by jon on 9/14/16.
 */
public abstract class SimpleJspPageAction extends JspPageAction
{
    @Override
    public JspView getView()
    {
        return new JspView(resolveJspPath(getPathToJsp(), getModule().getClass()), getModel());
    }

    /**
     * Resolves a JSP path to the absolute file name.
     *
     * Examples:
     * <ul>
     *     <li>/org/labkey/webutils/JspPages/views/pages/TestPage.jsp --> /org/labkey/webutils/JspPages/views/pages/TestPage.jsp</li>
     *     <li>/org/labkey/webutils/JspPages/views/pages/TestPage     --> /org/labkey/webutils/JspPages/views/pages/TestPage.jsp</li>
     *     <li>pages/TestPage.jsp, JspController.class                --> /org/labkey/webutils/JspPages/views/pages/TestPage.jsp</li>
     *     <li>pages/TestPage, JspController.class                    --> /org/labkey/webutils/JspPages/views/pages/TestPage.jsp</li>
     * </ul>
     *
     * @param path to the JSP file. It can be relative or absolute, and it can optionally omit the ".jsp"
     * @param baseClass A class to resolve the path relative to, if the path doesn't start with "/"
     * @return A properly formatted JSP path, ready for JspView.
     */
    private String resolveJspPath(@NotNull String path, Class baseClass)
    {
        if (path.startsWith("/")) {
            return path;
        }

        String newPath = getPackageDirFromClass(baseClass) + path;

        if (!newPath.endsWith(".jsp")) {
            newPath = newPath + ".jsp";
        }

        return newPath;
    }

    /**
     * Gets the package directory for a class.
     *
     * Takes the package name, prefixes and postfixes a "/", and changes all internal "."'s to "/"'s.
     * @param clazz The class to get the package path for.
     * @return A string representing the path to the class's directory, relative to source root.
     */
    private String getPackageDirFromClass(Class clazz)
    {
        return "/" + clazz.getPackage().getName().replace(".", "/") + "/";
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
