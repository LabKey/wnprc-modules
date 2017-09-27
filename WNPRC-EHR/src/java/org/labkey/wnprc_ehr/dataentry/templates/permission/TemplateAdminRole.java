package org.labkey.wnprc_ehr.dataentry.templates.permission;

import org.labkey.api.security.roles.AbstractRole;

/**
 * Created by jon on 5/23/17.
 */
public class TemplateAdminRole extends AbstractRole {
    public TemplateAdminRole() {
        super("Data Entry Template Admin", "Allows a user to delete or rename all templates, not just their own.", TemplateAdminPermission.class);
    }
}
