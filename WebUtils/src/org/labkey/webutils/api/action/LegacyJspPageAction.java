package org.labkey.webutils.api.action;

import org.labkey.api.view.JspView;
import org.labkey.api.view.template.PageConfig;
import org.labkey.webutils.api.model.JspPageModel;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by jon on 8/30/16.
 */
public abstract class LegacyJspPageAction extends SimpleJspPageAction {
    @Override
    public JspView<JspPageModel> getView() {
        JspView<JspPageModel> template = new JspView<JspPageModel>("/org/labkey/webutils/view/templates/LegacyJspPage.jsp", model);

        JspView<JspPageModel> inner = new JspView<JspPageModel>(getPathToJsp(), model);

        // Set the inner piece of the template
        template.setBody(inner);

        return template;
    }

    protected void beforeRender(HttpServletRequest request, HttpServletResponse response, ModelAndView modelAndView) {
        this.getPageConfig().setTemplate(PageConfig.Template.Home);
    }
}
