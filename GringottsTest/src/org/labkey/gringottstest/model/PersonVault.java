package org.labkey.gringottstest.model;

import org.labkey.api.data.Container;
import org.labkey.gringotts.api.model.Vault;


/**
 * Created by jon on 11/3/16.
 */
public class PersonVault extends Vault<PersonVault.Person> {
    public PersonVault(Container c) {
        super(c);
    }

    @Override
    public String getId() {
        return "";
    }

    @Override
    public String getName() {
        return null;
    }

    public class Person extends Vault.Record {

    }
}
