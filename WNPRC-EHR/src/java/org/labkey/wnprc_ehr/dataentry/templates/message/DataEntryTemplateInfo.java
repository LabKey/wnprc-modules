package org.labkey.wnprc_ehr.dataentry.templates.message;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

/**
 * Created by jon on 5/23/17.
 */
@SerializeToTS
public class DataEntryTemplateInfo {
    public String entityid;
    public String title;
    public boolean isOwner;
    public String formType;
    public int ownerId;
    public String ownerName;
}
