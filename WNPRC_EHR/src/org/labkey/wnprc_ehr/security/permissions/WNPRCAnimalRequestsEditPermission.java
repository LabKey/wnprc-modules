package org.labkey.wnprc_ehr.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class WNPRCAnimalRequestsEditPermission extends AbstractPermission
{
    public WNPRCAnimalRequestsEditPermission()
    {
        super("WNPRC EHR Animal Requests Edit Perm",
                "This permission allows the user to edit certain animal requests fields.");
    }
}
