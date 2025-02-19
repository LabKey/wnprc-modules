package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUILayoutEditorCreatorPermission extends AbstractPermission
{
    public CageUILayoutEditorCreatorPermission()
    {
        super("Cage UI Layout Editor Creator",
                "This permission allows the user to create rooms and templates in the layout editor.");
    }

}
