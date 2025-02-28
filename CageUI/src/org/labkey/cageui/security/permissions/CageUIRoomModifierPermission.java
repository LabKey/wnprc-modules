package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUIRoomModifierPermission extends AbstractPermission
{
    public CageUIRoomModifierPermission()
    {
        super("Cage UI Layout Editor Room Modifier",
                "This permission allows the user to load and modify non template rooms in the layout editor.");
    }
}
