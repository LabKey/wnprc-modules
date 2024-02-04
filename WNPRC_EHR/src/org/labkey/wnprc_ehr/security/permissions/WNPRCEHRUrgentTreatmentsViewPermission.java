package org.labkey.wnprc_ehr.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class WNPRCEHRUrgentTreatmentsViewPermission extends AbstractPermission
{
    public WNPRCEHRUrgentTreatmentsViewPermission()
    {
        super("WNPRC EHR Time Sensitive Treatment View Perm",
                "This permission allows the user to view certain time sensitive treatment fields.");
    }
}
