package org.labkey.wnprc_billing.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class EHRFinanceAdminPermission extends AbstractPermission {
    public EHRFinanceAdminPermission() {
        super("EHR Finance Manager",
                "This permission allows the user to modify the current program income account.");
    }
}
