package org.labkey.webutils.api.action;

import org.labkey.api.action.*;
import org.labkey.api.view.template.PageConfig;

/**
 * A base action to base other actions off of.
 *
 * Created by jon on 3/9/17.
 */
public abstract class SimpleAction extends PermissionCheckableAction implements HasPageConfig {
    // The SpringActionController populates a pageConfig for actions that implement HasPageConfig
    PageConfig _pageConfig;
    @Override public void setPageConfig(PageConfig page) { _pageConfig = page; }
    @Override public PageConfig getPageConfig()          { return _pageConfig; }
}
