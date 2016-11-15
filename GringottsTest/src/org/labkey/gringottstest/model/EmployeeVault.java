package org.labkey.gringottstest.model;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.gringotts.api.annotation.SerializeField;
import org.labkey.gringotts.api.exception.InvalidVaultException;
import org.labkey.gringotts.api.exception.RecordNotFoundException;
import org.labkey.gringotts.api.model.Vault;

/**
 * Created by jon on 11/13/16.
 */
public class EmployeeVault extends PersonVault<EmployeeVault.Employee> {
    public EmployeeVault(Container c, User user) throws InvalidVaultException {
        super(c, user);
    }

    @Override
    public String getDisplayName() {
        return "Employees";
    }

    public class Employee extends PersonVault.Person {
        public Employee() {
            super();
        }

        public Employee(String id) throws InvalidVaultException, RecordNotFoundException {
            super(id);
        }

        /*
         * Note here that we can't just assign here. The class body gets executed after the call to
         * super() but before the rest of the constructor body, so not checking for null overrides
         * any value that might have been bound from the database.
         */
        @SerializeField
        public EmployeeTypes employeeType = (this.employeeType == null) ? EmployeeTypes.FULL_TIME : this.employeeType;
    }
}
