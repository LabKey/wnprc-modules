package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUITemplateCreatorPermission extends AbstractPermission
{
    public CageUITemplateCreatorPermission()
    {
        super("Cage UI Layout Editor Template Creator",
                "This permission allows the user to access the full room creation process and make templates/rooms");
    }
}
