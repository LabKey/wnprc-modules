package org.labkey.webutils.api.model;

import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by jon on 1/21/16.
 */
public class JspPageModel {
    protected List<ModelAndView> _templates = new ArrayList<>();

    public JspPageModel() {}

    public void addTemplate(ModelAndView template) {
        _templates.add(template);
    }

    public List<ModelAndView> getTemplates() {
        return _templates;
    }
}
