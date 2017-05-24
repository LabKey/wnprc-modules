package org.labkey.wnprc_ehr.dataentry.templates.message;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

/**
 * Created by jon on 5/23/17.
 */
@SerializeToTS
public class DataEntryTemplateInfo {
    public String entityid;
    public String title;
    public int ownerId;
    public String ownerName;
    public String formType;
    public String description;
    public boolean isOwner;
    public boolean isPublic;
    public boolean isInGroup;
    public String createdBy;
}
