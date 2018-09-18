package org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

public class CytologyManualSection extends SimpleFormSection {
    public CytologyManualSection() {
        super("study", "Cytology Manual Evaluation", "Cytology Manual", "ehr-gridpanel");

        this.addConfigSource("Task");
        this.addConfigSource("Assay");
    }
}
