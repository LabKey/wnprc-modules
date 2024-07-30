package org.labkey.wnprc_ehr.security.roles;

import org.labkey.api.data.Container;
import org.labkey.api.ehr.security.EHRStartedInsertPermission;
import org.labkey.api.ehr.security.EHRStartedUpdatePermission;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.api.security.roles.Role;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.study.Dataset;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

public class WNPRCEHRFullSubmitterRole extends AbstractRole
{
    public WNPRCEHRFullSubmitterRole(){
        super("WNPRCEHR FullSubmitter", "Users extends EHRFullSubmitter by adding the ability to start procedure", WNPRC_EHRModule.class,
                EHRStartedInsertPermission.class,
                EHRStartedUpdatePermission.class);

        Role EHRFullSubmitter = RoleManager.getRole("org.labkey.ehr.security.EHRFullSubmitterRole");
        for (Class <? extends Permission> permClass : EHRFullSubmitter.getPermissions())
        {
            this.addPermission(permClass);
        }

        excludeGuests();
    }

    @Override
    public boolean isApplicable(SecurityPolicy policy, SecurableResource resource)
    {
        if (resource instanceof Container)
            return ((Container)resource).getActiveModules().contains(ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class));
        else if (resource instanceof Dataset)
            return ((Dataset)resource).getContainer().getActiveModules().contains(ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class));

        return false;
    }
}
