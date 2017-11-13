package org.labkey.wnprc_ehr.dataentry.templates.permission;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * Created by jon on 5/23/17.
 */
public class TemplateAdminPermission extends AbstractPermission {
    public TemplateAdminPermission() {
        super("Template Admin", "Allows the user to delete and all templates, including public templates.");
    }
}
