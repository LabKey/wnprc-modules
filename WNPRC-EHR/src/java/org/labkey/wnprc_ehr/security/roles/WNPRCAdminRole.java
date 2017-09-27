package org.labkey.wnprc_ehr.security.roles;

import org.labkey.wnprc_ehr.dataentry.templates.permission.TemplateAdminRole;
import org.labkey.wnprc_ehr.pathology.necropsy.security.role.NecropsyScheduler;

/**
 * Created by jon on 4/5/17.
 */
public class WNPRCAdminRole extends InheritableRole {
    public WNPRCAdminRole() {
        super("WNPRC Administrator", "Allows a user to do anything within the WNPRC module");

        inheritPermissionsFrom(new NecropsyScheduler());
        inheritPermissionsFrom(new BehaviorServiceWorker());
        inheritPermissionsFrom(new TemplateAdminRole());
    }
}
