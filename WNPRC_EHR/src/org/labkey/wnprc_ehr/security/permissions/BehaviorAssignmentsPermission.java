package org.labkey.wnprc_ehr.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * This permission grants access to the {@link org.labkey.wnprc_ehr.service.dataentry.BehaviorDataEntryService}.
 */
public class BehaviorAssignmentsPermission extends AbstractPermission {
    public BehaviorAssignmentsPermission() {
        super("EHR Behavior Assignment Manager",
                "This permission allows the user to add and end Behavior Assignments.");
    }
}
