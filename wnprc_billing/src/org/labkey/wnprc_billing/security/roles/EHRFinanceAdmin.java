package org.labkey.wnprc_billing.security.roles;

import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.wnprc_billing.security.permissions.EHRFinanceAdminPermission;

public class EHRFinanceAdmin extends AbstractRole {
    public EHRFinanceAdmin() {
        super("EHR Finance Admin",
                "This role allows users to modify the current program income account.",
                EHRFinanceAdminPermission.class
        );
//        super("EHR Finance Admin",
//                "This role allows users to modify the current program income account.",
//                EHRFinanceAdminPermission.class
//        );
    }
}