package org.labkey.gringotts.api.model;

import com.google.common.reflect.TypeToken;
import org.jetbrains.annotations.NotNull;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by jon on 10/19/16.
 */
public abstract class Record {
    private Map<TypeToken<? extends Record>, String> idMap = new HashMap<>();
    private final Vault vault;

    private Record(@NotNull Vault vault, Map<TypeToken<? extends Record>, String> ids) {
        this.vault = vault;
    }

    protected Record(@NotNull Vault vault) {
        
    }

    public Vault getVault() {
        return vault;
    }

    public void save() {
        getVault().saveRecord(this);
    }

    public void delete() {
        getVault().deleteRecord(this);
    }
}
