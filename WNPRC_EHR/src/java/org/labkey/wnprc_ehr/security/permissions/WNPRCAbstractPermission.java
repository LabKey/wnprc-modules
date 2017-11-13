package org.labkey.wnprc_ehr.security.permissions;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.security.permissions.AbstractPermission;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

/**
 * Created by jon on 4/5/17.
 */
public abstract class WNPRCAbstractPermission extends AbstractPermission {
    protected WNPRCAbstractPermission(@NotNull String name, @NotNull String description) {
        super(name, description, WNPRC_EHRModule.class);
    }
}
