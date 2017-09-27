package org.labkey.wnprc_ehr.pathology.necropsy.security.permission;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * Created by jon on 4/4/17.
 */
public class ScheduleNecropsyPermission extends AbstractPermission {
    public ScheduleNecropsyPermission() {
        super("EHR Necropsy Scheduler",
                "This permission allows the user to schedule (approve) necropsies.");
    }
}
