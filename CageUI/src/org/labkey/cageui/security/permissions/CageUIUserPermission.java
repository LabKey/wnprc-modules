package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUIUserPermission extends AbstractPermission
{
    public CageUIUserPermission()
    {
        super("Cage UI User",
                "This permission allows the user to access the cage UI");
    }

}
