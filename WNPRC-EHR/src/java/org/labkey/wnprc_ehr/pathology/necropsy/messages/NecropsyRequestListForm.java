package org.labkey.wnprc_ehr.pathology.necropsy.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by jon on 4/5/17.
 */
@SerializeToTS
public class NecropsyRequestListForm {
    public List<NecropsyRequestForm> requests = new ArrayList<>();
}
