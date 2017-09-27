package org.labkey.wnprc_ehr.pathology.necropsy.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

/**
 * Created by jon on 5/17/17.
 */
@SerializeToTS
public class NecropsySuiteInfo {
    public String roomCode;
    public String suiteName;
    public String color;
}
