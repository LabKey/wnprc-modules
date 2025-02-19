package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUILayoutEditorPermission extends AbstractPermission
{
    public CageUILayoutEditorPermission()
    {
        super("Cage UI Layout Editor",
                "This permission allows the user to view and make changes to rooms in the layout editor.");
    }

}
