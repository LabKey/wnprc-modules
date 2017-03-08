package org.labkey.webutils.view;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by jon on 3/7/17.
 */
public abstract class ReactPageModel {
    private List<String> _scripts = new ArrayList();

    abstract public String getTitle();

    public void registerScript(String path) {
        _scripts.add(path);
    }

    public List<String> getScripts() {
        List<String> scripts = new ArrayList<>();
        scripts.addAll(_scripts);
        return scripts;
    }
}
