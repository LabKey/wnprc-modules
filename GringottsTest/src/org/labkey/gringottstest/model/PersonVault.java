package org.labkey.gringottstest.model;

import org.labkey.api.data.Container;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.model.Vault;


/**
 * Created by jon on 11/3/16.
 */
public class PersonVault extends Vault<PersonVault.Person> {
    public PersonVault(Container c) throws InvalidVaultException {
        super(c);
    }

    @Override
    public String getDisplayName() {
        return "Persons";
    }

    public class Person extends Vault.Record {

    }
}
