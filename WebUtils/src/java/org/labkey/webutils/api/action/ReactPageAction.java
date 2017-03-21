package org.labkey.webutils.api.action;

import org.labkey.api.view.JspView;
import org.labkey.api.view.WebPartView;
import org.labkey.api.view.template.PageConfig;
import org.labkey.webutils.api.model.JspPageModel;
import org.labkey.webutils.api.model.ReactPageModel;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by jon on 3/7/17.
 */
public abstract class ReactPageAction extends SimpleJspPageAction {
    @Override
    protected JspPageModel getModel() {
        return new ReactPageModel();
    }

    @Override
    public JspView<JspPageModel> getView() {
        JspView<JspPageModel> template = new JspView<JspPageModel>("/org/labkey/webutils/view/ReactPage.jsp", model);

        JspView<JspPageModel> inner = new JspView<JspPageModel>(getResolvedJspPath(), model);
        inner.setFrame(WebPartView.FrameType.NONE);

        // Set the inner piece of the template
        template.setBody(inner);

        return template;
    }

    @Override
    protected void beforeRender(HttpServletRequest request, HttpServletResponse response, ModelAndView _pageView) {
        super.beforeRender(request, response, _pageView);

        // Reports should display without the LabKey header.
        getPageConfig().setTemplate(PageConfig.Template.None);
    }
}
