package org.labkey.webutils.api;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.view.JspView;
import org.springframework.web.servlet.ModelAndView;

/**
 * Created by jon on 2/23/16.
 */
abstract public class WebUtilsService {
    static WebUtilsService instance;
    public static WebUtilsService get() { return instance; }
    public static void setInstance(WebUtilsService instance) { WebUtilsService.instance = instance; }

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
     * @param path to the JSP file.  It can be relative or absolute, and it can optionally omit the ".jsp"
     * @param baseClass A class to resolve the path relative to, if the path doesn't start with "/"
     * @return A properly formatted JSP path, ready for JspView.
     */
    public static String resolveJspPath(@NotNull String path, Class baseClass) {
        if (path.startsWith("/")) {
            return path;
        }

        String newPath = WebUtilsService.getPackageDirFromClass(baseClass) + path;

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
    public static String getPackageDirFromClass(Class clazz) {
        return "/" + clazz.getPackage().getName().replace(".", "/") + "/";
    }

    /**
     * Renders a JspView to a String containing the HTML.
     *
     * You may want to do this to render a JSP page for an email.
     *
     * @param fullPathToJsp Fully qualified path (with ".jsp") to the JSP page to render.
     * @param container
     * @param user
     * @return
     */
    abstract public String renderView(String fullPathToJsp, Container container, User user) throws Exception;
    abstract public String renderView(String fullPathToJsp, Container container, User user, Object model) throws Exception;

    /*
     * These methods wrap the view passed in with either the JspPage template or the JspReport template.
     */
    abstract public ModelAndView getJspPageFromView(JspView view);
    abstract public ModelAndView getJspReportPageFromView(JspView view);
}
