package org.labkey.wnprc_ehr.pathology.necropsy.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.Date;

/**
 * Created by jon on 4/5/17.
 */
@SerializeToTS
public class NecropsyRequestForm {
    public String requestLsid;
    public String requestId;
    public String priority;
    public String animalId;
    public String requestedBy;
    public Date requestedOn;
    public Date requestedFor;
}
