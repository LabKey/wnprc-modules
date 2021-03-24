package org.labkey.wnprc_purchasing;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.module.DefaultFolderType;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.view.Portal;
import org.labkey.api.view.WebPartFactory;

import java.util.Arrays;
import java.util.Collections;

public class WNPRC_PurchasingFolderType extends DefaultFolderType
{
    public static final String NAME = "WNPRC Purchasing";

    public WNPRC_PurchasingFolderType(Module module)
    {
        super(NAME,
             "Folder type used for WNPRC Purchasing Requests",
             Arrays.asList(createWebPart("WNPRC Purchasing Landing Page")),
             Collections.emptyList(),
             getDefaultModuleSet(getModule("EHR_Purchasing"), module),
             module);
    }

    private static @Nullable Portal.WebPart createWebPart(String name)
    {
        WebPartFactory factory = Portal.getPortalPartCaseInsensitive(name);
        return null != factory ? factory.createWebPart(WebPartFactory.LOCATION_BODY) : null;
    }

    @Override
    public void configureContainer(Container c, User user)
    {
        //populate tables with initial set of values
        WNPRC_PurchasingManager.get().addQCStatus(c, user);
        WNPRC_PurchasingManager.get().addLineItemStatus(c, user);
        WNPRC_PurchasingManager.get().addItemUnits(c, user);

        //Add extensibleColumns
       WNPRC_PurchasingManager.get().addExtensibleColumns(c, user);
       WNPRC_PurchasingManager.get().addPaymentOptions(c, user);
    }

}
