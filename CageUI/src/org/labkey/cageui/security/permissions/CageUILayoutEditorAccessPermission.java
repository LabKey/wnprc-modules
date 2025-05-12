package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUILayoutEditorAccessPermission extends AbstractPermission
{
    public CageUILayoutEditorAccessPermission()
    {
        super("Cage UI Layout Editor",
                "This permission allows the user to visit the layout editor page");
    }

}
