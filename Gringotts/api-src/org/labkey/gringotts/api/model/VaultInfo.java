package org.labkey.gringotts.api.model;

import org.jetbrains.annotations.NotNull;

/**
 * Created by jon on 11/4/16.
 */
public class VaultInfo {
    private final String internalId;

    public VaultInfo(@NotNull String internalId) {
        this.internalId = internalId;
    }

    public String getInternalId() {
        return this.internalId;
    }
}
