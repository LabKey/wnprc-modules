package org.labkey.cageui.security.roles;

import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.cageui.CageUIModule;
import org.labkey.cageui.security.permissions.CageUIAnimalEditorPermission;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIModificationEditorPermission;
import org.labkey.cageui.security.permissions.CageUINotesEditorPermission;
import org.labkey.cageui.security.permissions.CageUIRoomModifierPermission;

public class CageUIRoomModifierRole extends AbstractRole
{
    public CageUIRoomModifierRole(){
        this("Cage UI Room Modifier Role",
                "Room modifier role for Cage UI",
                CageUIRoomModifierPermission.class,
                CageUIAnimalEditorPermission.class,
                CageUIModificationEditorPermission.class,
                CageUILayoutEditorAccessPermission.class,
                CageUINotesEditorPermission.class
        );
    }

    protected CageUIRoomModifierRole(String name, String description, Class<? extends Permission>... perms) {
        super(name, description, CageUIModule.class, perms);
    }

}
