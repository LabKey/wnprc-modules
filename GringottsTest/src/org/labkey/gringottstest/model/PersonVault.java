package org.labkey.gringottstest.model;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.gringotts.api.annotation.SerializeField;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.exception.RecordNotFoundException;
import org.labkey.gringotts.api.model.Vault;

import java.time.LocalDateTime;


/**
 * Created by jon on 11/3/16.
 */
public class PersonVault extends Vault<PersonVault.Person> {
    public PersonVault(Container c, User user) throws InvalidVaultException {
        super(c, user);
    }

    @Override
    public String getDisplayName() {
        return "Persons";
    }

    public class Person extends Vault.Record {
        public Person() {
            super();
        }

        public Person(String id) throws InvalidVaultException, RecordNotFoundException {
            super(id);
        }

        @SerializeField
        public String firstName;

        @SerializeField
        public String lastName;

        @SerializeField
        public String middleName;

        @SerializeField
        public Integer age; // I know this doesn't make sense to store, but I can't think of another integer to test with

        @SerializeField
        public LocalDateTime birthdate;
    }
}
