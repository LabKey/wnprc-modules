package org.labkey.wnprc_ehr.pathology.necropsy.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by jon on 5/17/17.
 */
@SerializeToTS
public class NecropsySuitesList {
    public List<NecropsySuiteInfo> suites = new ArrayList();
}
