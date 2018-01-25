package org.labkey.wnprc_compliance.security;

import org.labkey.api.security.roles.AbstractRole;

/**
 * Created by jon on 2/13/17.
 */
public class ComplianceAdminRole extends AbstractRole {
    public ComplianceAdminRole() {
        super("WNPRC Compliance Admin",
                "This role allows a user to manage all data in the WNPRC Compliance Module.",
                ComplianceAdminPermission.class);
    }
}
