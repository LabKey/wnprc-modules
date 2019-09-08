package org.labkey.wnprc_compliance.form;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

/**
 * Created by jmrichar on 2/8/2017.
 */
public class RequirementForm {
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    public Date dateCompleted;
    public String notes;
    public boolean pending = false;
}
