package org.labkey.webutils.api.model;

import com.drew.lang.annotations.Nullable;

/**
 * Created by jon on 3/7/17.
 */
public class ReactPageModel extends JspPageModel {
    private String _bundlePath = null;

    public void setBundlePath(String path) {
        _bundlePath = path;
    }

    @Nullable
    public String getBundlePath() {
        return _bundlePath;
    }
}
