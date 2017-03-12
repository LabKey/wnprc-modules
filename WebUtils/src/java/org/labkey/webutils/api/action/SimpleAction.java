package org.labkey.webutils.api.action;

import org.labkey.api.action.HasPageConfig;
import org.labkey.api.action.HasViewContext;
import org.labkey.api.action.PermissionCheckable;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.api.view.ViewContext;
import org.labkey.api.view.template.PageConfig;
import org.springframework.web.servlet.mvc.Controller;

/**
 * A base action to base other actions off of.
 *
 * Created by jon on 3/9/17.
 */
public abstract class SimpleAction implements Controller, HasViewContext, HasPageConfig, PermissionCheckable {
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
}
