package org.labkey.webutils.api;

import org.labkey.api.services.ServiceRegistry;
import org.labkey.api.view.JspView;

/**
 * Created by jon on 2/23/16.
 */
public interface WebUtilsService
{
    static WebUtilsService get()
    {
        return ServiceRegistry.get().getService(WebUtilsService.class);
    }

    static void setInstance(WebUtilsService instance)
    {
        ServiceRegistry.get().registerService(WebUtilsService.class, instance);
    }

    JspView getKnockoutTemplate(String templateName);
}
