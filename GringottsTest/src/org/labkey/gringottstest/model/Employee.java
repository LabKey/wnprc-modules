package org.labkey.gringottstest.model;

import org.labkey.gringotts.api.annotation.SerializeField;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.exception.RecordNotFoundException;
import org.labkey.gringotts.api.model.Vault;

/**
 * Created by jon on 11/14/16.
 */
public class Employee extends Person {
    public Employee(Vault vault) throws InvalidVaultException, RecordNotFoundException {
        super(vault);
    }

    public Employee(Vault vault, String id) throws InvalidVaultException, RecordNotFoundException {
        super(vault, id);
    }

    /*
     * Note here that we can't just assign here. The class body gets executed after the call to
     * super() but before the rest of the constructor body, so not checking for null overrides
     * any value that might have been bound from the database.
     */
    @SerializeField
    public EmployeeTypes employeeType = (this.employeeType == null) ? EmployeeTypes.FULL_TIME : this.employeeType;
}
