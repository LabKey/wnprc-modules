package org.labkey.wnprc_ehr.security.roles;


import org.labkey.api.ehr.security.EHRScheduledInsertPermission;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.Group;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.api.security.roles.Role;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.study.Dataset;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

public class WNPRCEHRRequestorSchedulerRole extends AbstractRole
{
    //TODO: change name to include scheduler, look into
    //RoleManager.java to get role and look for permission and add Schedule permission
    public WNPRCEHRRequestorSchedulerRole()
    {
        super("WNPRCEHR Requestor Scheduler", "Users extends EHR Requestor adding the ability to Schedule, but not approve them",
                EHRScheduledInsertPermission.class
        );

        //Adding permission from EHRRequestorRole, this class role adds the schedule insert permission for food deprives
        Role EHRRequestor  = RoleManager.getRole("org.labkey.ehr.security.EHRRequestorRole");
        for (Class <? extends Permission> permClass : EHRRequestor.getPermissions())
        {
            this.addPermission(permClass);
        }


        addExcludedPrincipal(org.labkey.api.security.SecurityManager.getGroup(Group.groupGuests));
    }

    @Override
    public boolean isApplicable(SecurityPolicy policy, SecurableResource resource)
    {
        return resource instanceof Dataset &&
                ((Dataset)resource).getContainer().getActiveModules().contains(ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class));
    }
}
