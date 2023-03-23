package org.labkey.wnprc_billing.security.roles;

import org.labkey.api.security.roles.AbstractRole;
import org.labkey.wnprc_billing.security.permissions.EHRFinanceAdminPermission;

public class EHRFinanceAdmin extends AbstractRole {
    public EHRFinanceAdmin() {
        super(name: "Test", description: "test", EHRFinanceAdminPermission.class
        );
    }
}