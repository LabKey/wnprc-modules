package org.labkey.wnprc_compliance.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * Created by jon on 2/13/17.
 */
public class ComplianceAdminPermission extends AbstractPermission {
    public ComplianceAdminPermission() {
        super("WNPRC Compliance Admin", "This permission allows the user to manipulate compliance information.");
    }
}
