package org.labkey.wnprc_virology.security.roles;

import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.wnprc_virology.WNPRC_VirologyModule;
import org.labkey.wnprc_virology.security.permissions.WNPRCViralLoadReadPermission;

public class WNPRCViralLoadReaderRole extends AbstractRole
{

        public WNPRCViralLoadReaderRole(){
                this("WNPRC Viral Load Reader", "Role for reading VL data, simplifies email notifications", ReadPermission.class, WNPRCViralLoadReadPermission.class );
        }

        protected WNPRCViralLoadReaderRole(String name, String description, Class<? extends Permission>... perms) {
                super(name, description, WNPRC_VirologyModule.class, perms);
        }

}
