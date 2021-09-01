package org.labkey.wnprc_ehr.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class WNPRCAnimalRequestsViewPermission extends AbstractPermission
{
    public WNPRCAnimalRequestsViewPermission()
    {
        super("WNPRC EHR Animal Requests View Perm",
                "This permission allows the user to view certain animal requests fields.");
    }
}
