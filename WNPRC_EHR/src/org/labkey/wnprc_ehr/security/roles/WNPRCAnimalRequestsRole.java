package org.labkey.wnprc_ehr.security.roles;

import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.security.permissions.WNPRCAnimalRequestsEditPermission;
import org.labkey.wnprc_ehr.security.permissions.WNPRCAnimalRequestsViewPermission;

public class WNPRCAnimalRequestsRole extends AbstractRole
{

        public WNPRCAnimalRequestsRole(){
                this("WNPRC Animal Requests", "Role for viewing/editing animal request items", WNPRCAnimalRequestsViewPermission.class, WNPRCAnimalRequestsEditPermission.class);
        }

        protected WNPRCAnimalRequestsRole(String name, String description, Class<? extends Permission>... perms) {
                super(name, description, WNPRC_EHRModule.class, perms);
        }

}
