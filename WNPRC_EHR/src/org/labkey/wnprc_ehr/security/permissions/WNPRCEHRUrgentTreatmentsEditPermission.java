package org.labkey.wnprc_ehr.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class WNPRCEHRUrgentTreatmentsEditPermission extends AbstractPermission
{
    public WNPRCEHRUrgentTreatmentsEditPermission()
    {
        super("WNPRC EHR Time Sensitive Treatments Edit Perm",
                "This permission allows the user to edit certain time sensitive treatment fields.");
    }
}
