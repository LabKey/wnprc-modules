package org.labkey.webutils.api.action;

import org.labkey.api.view.JspView;
import org.labkey.api.view.template.PageConfig;
import org.labkey.webutils.api.WebUtilsService;
import org.labkey.webutils.api.model.JspPageModel;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by jon on 9/16/16.
 */
public abstract class SimpleJspReportAction extends SimpleJspPageAction {
    @Override
    public JspView<JspPageModel> getView() {
        JspView<JspPageModel> template = new JspView<JspPageModel>("/org/labkey/webutils/view/templates/LegacyJspPage.jsp", model);

        JspView<JspPageModel> inner = new JspView<JspPageModel>(getResolvedJspPath(), model);

        // Set the inner piece of the template
        template.setBody(inner);

        return template;
    }

    @Override
    protected void beforeRender(HttpServletRequest request, HttpServletResponse response, ModelAndView _pageView) {
        super.beforeRender(request, response, _pageView);

        // Reports should display without the LabKey header.
        getPageConfig().setTemplate(PageConfig.Template.Body);
    }
}
