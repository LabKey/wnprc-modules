package org.labkey.cageui.security.roles;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.cageui.CageUIModule;
import org.labkey.cageui.security.permissions.CageUIAnimalEditorPermission;
import org.labkey.cageui.security.permissions.CageUIModificationEditorPermission;

public class CageUIModificationEditorRole extends AbstractRole
{

    public CageUIModificationEditorRole(){
        this("Cage UI Cage Modification Editor",
                "Cage modification editor role for Cage UI",
                CageUIAnimalEditorPermission.class,
                CageUIModificationEditorPermission.class
        );
    }

    protected CageUIModificationEditorRole(String name, String description, Class<? extends Permission>... perms) {
        super(name, description, CageUIModule.class, perms);
    }

}

