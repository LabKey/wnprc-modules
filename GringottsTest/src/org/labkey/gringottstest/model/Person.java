package org.labkey.gringottstest.model;

import org.jetbrains.annotations.Nullable;
import org.labkey.gringotts.api.annotation.SerializeField;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.exception.RecordNotFoundException;
import org.labkey.gringotts.api.model.Record;
import org.labkey.gringotts.api.model.Vault;

import java.time.LocalDateTime;

/**
 * Created by jon on 11/14/16.
 */
public class Person extends Record {
    @SerializeField public String firstName;
    @SerializeField public String middleName;
    @SerializeField public String lastName;

    @SerializeField
    public Integer age; // I know this doesn't make sense to store, but I can't think of another integer to test with

    @SerializeField
    public LocalDateTime birthdate;

    public Person(Vault vault, @Nullable String id) throws InvalidVaultException, RecordNotFoundException {
        super(vault, id);
    }

    public Person(Vault vault) throws InvalidVaultException, RecordNotFoundException {
        super(vault);
    }
}
