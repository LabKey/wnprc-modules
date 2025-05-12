package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUIAnimalEditorPermission extends AbstractPermission
{
    public CageUIAnimalEditorPermission()
    {
        super("Cage UI Animal Editor",
                "This permission allows the user to add/move animals between locations");
    }

}
