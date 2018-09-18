package org.labkey.wnprc_ehr.dataentry.forms.Birth.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

/**
 * Created by jon on 10/7/15.
 */
public class BirthFormSection extends SimpleFormSection {
    public BirthFormSection() {
        super("study", "Birth", "Birth", "ehr-gridpanel");
        addConfigSource("Task");
    }
}
