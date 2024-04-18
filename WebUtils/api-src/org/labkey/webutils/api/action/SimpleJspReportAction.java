package org.labkey.webutils.api.action;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.labkey.api.view.template.PageConfig;
import org.springframework.web.servlet.ModelAndView;

/**
 * Created by jon on 9/16/16.
 */
public abstract class SimpleJspReportAction extends SimpleJspPageAction {
    @Override
    protected void beforeRender(HttpServletRequest request, HttpServletResponse response, ModelAndView _pageView) {
        super.beforeRender(request, response, _pageView);

        // Reports should display without the LabKey header.
        getPageConfig().setTemplate(PageConfig.Template.Body);
    }
}
