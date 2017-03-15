package org.labkey.webutils.api.action;

import org.labkey.api.view.JspView;
import org.labkey.webutils.api.WebUtilsService;
import org.labkey.webutils.api.action.annotation.JspPath;
import org.labkey.webutils.api.action.annotation.PageTitle;
import org.labkey.webutils.api.model.JspPageModel;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by jon on 9/14/16.
 */
public abstract class SimpleJspPageAction extends SimpleAction {
    protected JspPageModel model = getModel();

    @Override
    public ModelAndView handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
        // Set the title
        model.setTitle(getTitle());
        getPageConfig().setTitle(model.getTitle());

        JspView<JspPageModel> view = getView();

        // Call the before render hook.
        this.beforeRender(request, response, view);

        return view;
    }

    public JspView<JspPageModel> getView() {
        return new JspView<JspPageModel>(getResolvedJspPath(), model);
    }

    protected String getResolvedJspPath() {
        return WebUtilsService.resolveJspPath(getPathToJsp(), getBaseClass());
    }

    /**
     * Returns an absolute package path (/org/labkey/webutils/...) to the JSP.
     *
     * By default, relative paths (ones that don't start with "/") are resolved relative module class that
     * registered the controller returned by getControllerName().
     *
     * @return a path to the JSP
     */
    public String getPathToJsp() {
        Class thisClass = this.getClass();

        if (thisClass.isAnnotationPresent(JspPath.class)) {
            JspPath jspPath = (JspPath) thisClass.getAnnotation(JspPath.class);

            return jspPath.value();
        }

        return "/org/labkey/webutils/view/TestPage.jsp";
    }

    protected Class getBaseClass() {
        return this.getClass();
    }

    public String getTitle() {
        Class thisClass = this.getClass();

        if (thisClass.isAnnotationPresent(PageTitle.class)) {
            PageTitle pageTitle = (PageTitle) thisClass.getAnnotation(PageTitle.class);

            return pageTitle.value();
        }

        return "LabKey";
    }

    /**
     * An overridable hook before the page starts to render.
     *
     * This allows you to manipulate the pageConfig or something before actually rendering the page.
     * If you want to redirect the page, you should throw a RedirectException here.  In addition, if
     * you want to change the headers or throw an UnauthorizedException, do it here because, once the
     * page has started to render, it's too late to change headers or throw those types of exceptions.
     *
     * You may also add client dependencies here.
     *
     * @param request The HttpServletRequest for this request.
     * @param response The HttpServletResponse for this request.
     * @param _pageView The JspView that wraps your view and represents the actual page's Model and View.
     */
    protected void beforeRender(HttpServletRequest request, HttpServletResponse response, ModelAndView _pageView) {

    }

    protected JspPageModel getModel() {
        return new JspPageModel();
    }
}
