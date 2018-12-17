package org.labkey.wnprc_ehr.security.roles;

import org.labkey.api.security.roles.AbstractRole;
import org.labkey.wnprc_ehr.security.permissions.BehaviorAssignmentsPermission;

/**
 * Created by jon on 10/28/16.
 */
public class BehaviorServiceWorker extends AbstractRole {
    public BehaviorServiceWorker() {
        super("EHR Behavior Services",
                "This role allows users to add and edit behavior assignments.",
                BehaviorAssignmentsPermission.class
        );
    }
}
