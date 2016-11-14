package org.labkey.gringottstest.test;

import com.google.common.reflect.TypeToken;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.gringottstest.model.EmployeeTypes;
import org.labkey.gringottstest.model.EmployeeVault;
import org.labkey.gringottstest.model.PersonVault;

import java.time.LocalDateTime;
import java.time.Month;

/**
 * Created by jon on 11/14/16.
 */
public class BasicFunctionality extends AbstractTestSuite {
    public BasicFunctionality(User user, Container container) {
        super(user, container);
    }

    @Override
    public void afterAll(JSONObject results) {
        // TODO: delete all test records.
    }

    public class PrimativeValueStorageAndRetrieval extends Test {
        @Override
        void runTest() throws Exception {
            String firstName = "Edward";
            String middleName = "Percival";
            String lastName  = "Nygma";
            Integer age = 3;
            LocalDateTime birthdate = LocalDateTime.of(1985, Month.APRIL, 1, 0, 0, 0);

            PersonVault<PersonVault.Person> vault = new PersonVault(getContainer(), getUser());

            PersonVault.Person jon = vault.new Person();

            jon.firstName = firstName;
            jon.middleName = middleName;
            jon.lastName = lastName;
            jon.birthdate = birthdate;
            jon.age = age;

            jon.save();

            String jonsId = jon.getId(TypeToken.of(jon.getClass()));

            PersonVault.Person jon2 = vault.new Person(jonsId);

            assert jon2.age.equals(age);
            assert jon2.birthdate.isEqual(birthdate);
            assert jon2.firstName.equals(firstName);
            assert jon2.lastName.equals(lastName);
            assert jon2.middleName.equals(middleName);

            // Sometimes the guy can take the girl's name...
            jon2.lastName = "Kringle";

            jon2.save();

            PersonVault.Person jon3 = vault.new Person(jonsId);

            assert jon3.lastName.equals("Kringle");
        }
    }

    public class SimpleInheritanceAndEnumValues extends Test {
        @Override
        void runTest() throws Exception {
            EmployeeVault employeeVault = new EmployeeVault(getContainer(), getUser());

            EmployeeVault.Employee jGordon = employeeVault.new Employee();

            jGordon.firstName = "James";
            jGordon.middleName = "Worthington";
            jGordon.lastName = "Gordon";

            jGordon.age = 40;
            jGordon.birthdate = LocalDateTime.of(1985, Month.JULY, 6, 0, 0);
            jGordon.employeeType = EmployeeTypes.STUDENT;

            jGordon.save();

            EmployeeVault.Employee jG2 = employeeVault.new Employee(jGordon.getId(TypeToken.of(jGordon.getClass())));

            assert jG2.employeeType.equals(EmployeeTypes.STUDENT);
        }
    }
}
