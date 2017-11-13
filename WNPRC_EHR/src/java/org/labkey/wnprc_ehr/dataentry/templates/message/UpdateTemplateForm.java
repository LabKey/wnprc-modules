package org.labkey.wnprc_ehr.dataentry.templates.message;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

/**
 * Created by jon on 5/24/17.
 */
@SerializeToTS
public class UpdateTemplateForm {
    public String title;
    public String description;
    public int owner;
}
