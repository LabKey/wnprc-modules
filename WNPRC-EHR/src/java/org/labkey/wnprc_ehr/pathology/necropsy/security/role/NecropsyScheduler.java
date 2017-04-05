package org.labkey.wnprc_ehr.pathology.necropsy.security.role;

import org.labkey.wnprc_ehr.pathology.necropsy.security.permission.ScheduleNecropsyPermission;
import org.labkey.wnprc_ehr.security.roles.InheritableRole;

/**
 * Created by jon on 4/5/17.
 */
public class NecropsyScheduler extends InheritableRole {
    public NecropsyScheduler() {
        super("WNPRC Necropsy Scheduler", "Allowed to approve and schedule necropsies", ScheduleNecropsyPermission.class);

        inheritPermissionsFrom(new NecropsyViewer());
    }
}
