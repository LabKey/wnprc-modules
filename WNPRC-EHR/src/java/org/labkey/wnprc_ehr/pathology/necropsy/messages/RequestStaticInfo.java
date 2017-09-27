package org.labkey.wnprc_ehr.pathology.necropsy.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

/**
 * Created by jon on 5/16/17.
 */
@SerializeToTS
public class RequestStaticInfo {
    public String requestid;
    public String priority;
    public String animalid;
    public String comments;
}
