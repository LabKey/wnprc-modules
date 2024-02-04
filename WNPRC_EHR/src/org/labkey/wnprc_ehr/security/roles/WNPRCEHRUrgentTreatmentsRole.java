package org.labkey.wnprc_ehr.security.roles;

import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.security.permissions.WNPRCEHRUrgentTreatmentsEditPermission;
import org.labkey.wnprc_ehr.security.permissions.WNPRCEHRUrgentTreatmentsViewPermission;

public class WNPRCEHRUrgentTreatmentsRole extends AbstractRole
{

    public WNPRCEHRUrgentTreatmentsRole(){
        this("WNPRC Time Sensitive Treatments", "Role for viewing/editing time sensitive treatments", WNPRCEHRUrgentTreatmentsViewPermission.class, WNPRCEHRUrgentTreatmentsEditPermission.class);
    }

    protected WNPRCEHRUrgentTreatmentsRole(String name, String description, Class<? extends Permission>... perms) {
        super(name, description, WNPRC_EHRModule.class, perms);
    }

}
