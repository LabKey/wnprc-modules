package org.labkey.wnprc_ehr.security.roles;


import org.labkey.api.module.Module;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.api.security.roles.Role;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

/**
 * Created by jon on 4/5/17.
 */
public abstract class InheritableRole extends AbstractRole {
    protected InheritableRole(String name, String description, Class<? extends Permission>... perms) {
        super(name, description, WNPRC_EHRModule.class, perms);
    }

    protected void inheritPermissionsFrom(Role role) {
        role.getPermissions();

        for (Class<? extends Permission> perm : role.getPermissions()) {
            this.addPermission(perm);
        }
    }
}
