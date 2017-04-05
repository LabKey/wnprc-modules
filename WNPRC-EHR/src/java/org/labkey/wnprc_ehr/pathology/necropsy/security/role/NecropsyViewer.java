package org.labkey.wnprc_ehr.pathology.necropsy.security.role;


import org.labkey.api.security.roles.AbstractRole;
import org.labkey.wnprc_ehr.pathology.necropsy.security.permission.ViewNecropsyPermission;

/**
 * Created by jon on 4/5/17.
 */
public class NecropsyViewer extends AbstractRole {
    public NecropsyViewer() {
        super("WNPRC Necropsy Viewer",
                "This role allows users to view the necropsy schedule and necropsy reports.",
                ViewNecropsyPermission.class);
    }
}
