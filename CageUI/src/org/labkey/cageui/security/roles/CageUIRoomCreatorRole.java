package org.labkey.cageui.security.roles;

import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.cageui.CageUIModule;
import org.labkey.cageui.security.permissions.CageUIAnimalEditorPermission;
import org.labkey.cageui.security.permissions.CageUIAnimalReviewerPermission;
import org.labkey.cageui.security.permissions.CageUIModificationEditorPermission;
import org.labkey.cageui.security.permissions.CageUINotesEditorPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUIRoomModifierPermission;

public class CageUIRoomCreatorRole extends AbstractRole
{

    public CageUIRoomCreatorRole(){
        this("Cage UI Room Creator",
                "Room creator role for Cage UI",
                CageUIRoomModifierPermission.class,
                CageUIRoomCreatorPermission.class,
                CageUIAnimalEditorPermission.class,
                CageUIAnimalReviewerPermission.class,
                CageUIModificationEditorPermission.class,
                CageUINotesEditorPermission.class
        );
    }

    protected CageUIRoomCreatorRole(String name, String description, Class<? extends Permission>... perms) {
        super(name, description, CageUIModule.class, perms);
    }

}
