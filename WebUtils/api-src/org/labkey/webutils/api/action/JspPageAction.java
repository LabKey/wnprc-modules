package org.labkey.webutils.api.action;

import org.labkey.api.action.BaseViewAction;
import org.labkey.api.action.HasPageConfig;
import org.labkey.api.action.HasViewContext;
import org.labkey.api.action.PermissionCheckable;
import org.labkey.api.module.Module;
import org.labkey.api.view.JspView;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.template.PageConfig;
import org.labkey.webutils.api.WebUtilsService;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.Controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by jon on 8/30/16.
 *
 * I recommend that implementers first create an abstract class for their controller, referencing the controller
 * in getControllerName(), so that other actions in that module only need the page's title and the path to the JSP.
 *
 * Note that it is expected that this class only be implemented as subclasses of SpringActionController, as that
 * controller handles populating the pageConfig and viewContext before calling handleRequest, calls handleRequest
 * to get the ModelAndView, and then calls render on the ModelAndView after handleRequest returns.
 */
public abstract class JspPageAction implements Controller, HasViewContext, HasPageConfig, PermissionCheckable {
    @Override
    public ModelAndView handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ModelAndView _pageView = getModelAndView(request, response);

        // Set the title
        getPageConfig().setTitle(getTitle());

        // Call the before render hook.
        this.beforeRender(request, response, _pageView);

        return _pageView;
    }

    protected ModelAndView getModelAndView(HttpServletRequest request, HttpServletResponse response) {
        return WebUtilsService.get().getJspPageFromView(getView());
    }

    // The SpringActionController populates a pageConfig for actions that implement HasPageConfig
    PageConfig _pageConfig;
    @Override public void setPageConfig(PageConfig page) { _pageConfig = page; }
    @Override public PageConfig getPageConfig()          { return _pageConfig; }

    // The SpringActionController populates a viewContext for actions that implement it.
    ViewContext _viewContext;
    @Override public void setViewContext(ViewContext context) { _viewContext = context; }
    @Override public ViewContext getViewContext()             { return _viewContext; }

    // The SpringActionController uses this method (part of PermissionCheckable) to check for permission to access
    // the specified page.
    @Override public void checkPermissions() throws UnauthorizedException {
        /*
         * TODO: re-implement permission checking.

        try {
            BaseViewAction.checkActionPermissions(this.getClass(), getViewContext(), null);
        }
        catch (UnauthorizedException e) {
            e.setUseBasicAuthentication(false);
            throw e;
        }
        */
    }

    public java.lang.Class getBaseClass() {
        return getModule().getClass();
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
    protected void beforeRender(HttpServletRequest request, HttpServletResponse response, ModelAndView _pageView) {}

    /**
     * Returns the AbstractJspView to render on the page.
     *
     * @return an AbstractJspView to render on the page.
     */
    public abstract JspView getView();

    /**
     * Returns the page's title to display in the tab or window title bar.
     *
     * @return A string to display as the page's title
     */
    public abstract String getTitle();

    /**
     * The Module to use to resolve client dependencies and relative JSP page paths.
     *
     * @return a Module object.
     */
    public abstract Module getModule();
}
