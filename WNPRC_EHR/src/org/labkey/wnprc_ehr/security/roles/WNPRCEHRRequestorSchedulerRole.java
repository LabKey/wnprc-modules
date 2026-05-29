/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.wnprc_ehr.security.roles;


import org.labkey.api.ehr.security.EHRScheduledInsertPermission;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.api.security.roles.Role;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.study.Dataset;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

public class WNPRCEHRRequestorSchedulerRole extends AbstractRole
{
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

        excludeGuests();
    }

    @Override
    public boolean isApplicable(SecurableResource resource)
    {
        return resource instanceof Dataset &&
                ((Dataset)resource).getContainer().getActiveModules().contains(ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class));
    }
}
