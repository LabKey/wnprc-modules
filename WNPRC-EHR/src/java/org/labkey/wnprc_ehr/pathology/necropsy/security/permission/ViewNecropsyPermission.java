package org.labkey.wnprc_ehr.pathology.necropsy.security.permission;

import org.labkey.wnprc_ehr.security.permissions.WNPRCAbstractPermission;

/**
 * Created by jon on 4/5/17.
 */
public class ViewNecropsyPermission extends WNPRCAbstractPermission {
    public ViewNecropsyPermission() {
        super("WNPRC View Necropsy", "This permission allows users to view the necropsy schedule and necropsy reports.");
    }
}
