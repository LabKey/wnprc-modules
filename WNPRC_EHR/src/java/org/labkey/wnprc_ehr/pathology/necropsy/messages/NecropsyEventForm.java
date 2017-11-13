package org.labkey.wnprc_ehr.pathology.necropsy.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.Date;

/**
 * Created by jon on 4/5/17.
 */
@SerializeToTS
public class NecropsyEventForm {
    public String lsid;
    public String animalId;
    public Date scheduledDate;
    public String color;
}
