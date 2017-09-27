package org.labkey.wnprc_ehr.dataentry.templates.message;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.List;

/**
 * Created by jon on 5/23/17.
 */
@SerializeToTS
public class ManageTemplatesInfo {
    public List<DataEntryTemplateInfo> templates;
    public boolean isAdmin;
}
