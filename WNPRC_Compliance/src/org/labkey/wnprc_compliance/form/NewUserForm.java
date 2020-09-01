package org.labkey.wnprc_compliance.form;

import java.util.List;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Created by jmrichar on 2/8/2017.
 */
public class NewUserForm {
    public String firstName;
    public String lastName;
    public String middleName;
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    public Date dateOfBirth;
    public String description;
    public boolean isEmployee;
    public List<Integer> userIds;
    public List<Integer> cardNumbers;
}
