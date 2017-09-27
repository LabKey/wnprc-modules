package org.labkey.wnprc_ehr.pathology.necropsy.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

/**
 * Created by jon on 4/5/17.
 */
@SerializeToTS
public class NecropsyRequestDetailsForm {
    public RequestStaticInfo staticInfo;
    public ScheduleNecropsyForm form;
}
