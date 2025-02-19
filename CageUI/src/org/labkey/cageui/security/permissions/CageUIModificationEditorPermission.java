package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUIModificationEditorPermission extends AbstractPermission
{
    public CageUIModificationEditorPermission()
    {
        super("Cage UI Modification Editor",
                "This permission allows the user to create/update/delete cage modifications");
    }

}
