package org.labkey.webutils.api.model;

import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by jon on 1/21/16.
 */
public class JspPageModel {
    private String _title = defaultTitle();
    protected List<ModelAndView> _templates = new ArrayList<>();
    private List<String> _scripts = new ArrayList();
    private List<String> _stylesheets = new ArrayList<>();

    public JspPageModel() {}

    public void addTemplate(ModelAndView template) {
        _templates.add(template);
    }

    public List<ModelAndView> getTemplates() {
        return _templates;
    }

    public String getTitle() {
        return this._title;
    }

    public void setTitle(String title) {
        _title = title;
    }

    protected String defaultTitle() {
        return "";
    }

    public void registerScript(String path) {
        _scripts.add(path);
    }

    public List<String> getScripts() {
        List<String> scripts = new ArrayList<>();
        scripts.addAll(_scripts);
        return scripts;
    }

    public void registerStylesheet(String path) {
        _stylesheets.add(path);
    }

    public List<String> getStylesheets() {
        List<String> sheets = new ArrayList<>();
        sheets.addAll(_stylesheets);
        return sheets;
    }
}
