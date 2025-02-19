package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUILayoutTemplateEditorPermission extends AbstractPermission
{
    public CageUILayoutTemplateEditorPermission()
    {
        super("Cage UI Layout Template Editor ",
                "This permission allows the user to make rooms from templates");
    }

}
