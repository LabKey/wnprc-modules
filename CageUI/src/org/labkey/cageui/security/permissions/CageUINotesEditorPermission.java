package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUINotesEditorPermission extends AbstractPermission
{
    public CageUINotesEditorPermission()
    {
        super("Cage UI Notes Editor",
                "This permission allows the user to create/update/delete animal notes");
    }

}
