package org.labkey.cageui.security.roles;

import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.cageui.CageUIModule;
import org.labkey.cageui.security.permissions.CageUIAnimalEditorPermission;
import org.labkey.cageui.security.permissions.CageUIAnimalReviewerPermission;
import org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission;
import org.labkey.cageui.security.permissions.CageUIModificationEditorPermission;
import org.labkey.cageui.security.permissions.CageUINotesEditorPermission;
import org.labkey.cageui.security.permissions.CageUIRoomCreatorPermission;
import org.labkey.cageui.security.permissions.CageUIRoomModifierPermission;
import org.labkey.cageui.security.permissions.CageUITemplateCreatorPermission;

public class CageUIAdminRole extends AbstractRole
{

    public CageUIAdminRole(){
        this("Cage UI Admin",
                "Administrator role for Cage UI",
                CageUITemplateCreatorPermission.class,
                CageUILayoutEditorAccessPermission.class,
                CageUIRoomModifierPermission.class,
                CageUIRoomCreatorPermission.class,
                CageUIAnimalEditorPermission.class,
                CageUIAnimalReviewerPermission.class,
                CageUIModificationEditorPermission.class,
                CageUINotesEditorPermission.class
        );
    }

    protected CageUIAdminRole(String name, String description, Class<? extends Permission>... perms) {
        super(name, description, CageUIModule.class, perms);
    }

}
