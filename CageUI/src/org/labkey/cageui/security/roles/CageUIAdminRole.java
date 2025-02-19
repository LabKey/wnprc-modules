package org.labkey.cageui.security.roles;

import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.cageui.CageUIModule;
import org.labkey.cageui.security.permissions.CageUILayoutEditorPermission;

public class CageUIAdminRole extends AbstractRole
{

    public CageUIAdminRole(){
        this("WNPRC Time Sensitive Treatments",
                "Role for viewing/editing time sensitive treatments",
                CageUILayoutEditorPermission.class
        );
    }

    protected CageUIAdminRole(String name, String description, Class<? extends Permission>... perms) {
        super(name, description, CageUIModule.class, perms);
    }

}
