package org.labkey.webutils;

import org.labkey.api.view.JspView;
import org.labkey.webutils.api.WebUtilsService;

/**
 * Created by jon on 2/23/16.
 */
public class WebUtilsServiceImpl implements WebUtilsService
{
    @Override
    public JspView getKnockoutTemplate(String templateName)
    {
        //String _packagePathDir = WebUtilsServiceImpl.getPackageDirFromClass(JspPage.class);
        return new JspView<>("/org/labkey/webutils/view/knockout_components/" + templateName + ".jsp");
    }
}
