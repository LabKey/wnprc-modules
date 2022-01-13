package org.labkey.wnprc_virology.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class WNPRCViralLoadReadPermission extends AbstractPermission
{
    public WNPRCViralLoadReadPermission()
    {
        super("WNPRC Viral Load Read Perm",
                "This permission allows the user to read viral load folder.");
    }
}
