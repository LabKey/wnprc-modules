package org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

public class CytologyAutomatedSection extends SimpleFormSection {
    public CytologyAutomatedSection() {
        super("study", "Cytology Automated Evalutation", "Cytology Automated", "ehr-gridpanel");

        this.addConfigSource("Task");
        this.addConfigSource("Assay");
    }
}
