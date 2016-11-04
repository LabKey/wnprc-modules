package org.labkey.gringottstest.model;

import org.labkey.gringotts.api.model.Record;
import org.labkey.gringotts.api.model.Vault;

/**
 * Created by jon on 11/3/16.
 */
public class Person implements Record {
    @Override
    public Vault getVault()
    {
        return null;
    }
}
