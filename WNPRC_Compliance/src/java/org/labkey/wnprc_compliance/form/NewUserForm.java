package org.labkey.wnprc_compliance.form;

import java.util.List;
import java.util.Date;

/**
 * Created by jmrichar on 2/8/2017.
 */
public class NewUserForm {
    public String firstName;
    public String lastName;
    public String middleName;
    public Date dateOfBirth;
    public String description;
    public boolean isEmployee;
    public List<Integer> userIds;
    public List<Integer> cardNumbers;
}
