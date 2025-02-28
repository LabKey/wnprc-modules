package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;


public class CageUIRoomCreatorPermission extends AbstractPermission
{
    public CageUIRoomCreatorPermission()
    {
        super("Cage UI Layout Editor Room Creator",
                "This permission allows the user to load template rooms and save as real rooms");
    }

}
