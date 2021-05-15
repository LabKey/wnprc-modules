package org.labkey.wnprc_purchasing.security;

import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.roles.AbstractModuleScopedRole;
import org.labkey.wnprc_purchasing.WNPRC_PurchasingModule;

public class WNPRC_PurchasingDirectorRole extends AbstractModuleScopedRole
{
    public static final String PURCHASING_DIRECTOR_ROLE_NAME = "WNPRC Purchasing Director";
    public WNPRC_PurchasingDirectorRole()
    {
        super(PURCHASING_DIRECTOR_ROLE_NAME, "This role is used to approve purchase orders that are over $5000.",
                WNPRC_PurchasingModule.class,
                AdminPermission.class
        );
    }
}

