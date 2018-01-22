package org.labkey.webutils.api.action;

import org.labkey.api.view.template.PageConfig;
import org.labkey.webutils.api.WebUtilsService;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
