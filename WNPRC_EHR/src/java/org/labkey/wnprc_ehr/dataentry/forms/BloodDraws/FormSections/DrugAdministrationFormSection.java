package org.labkey.wnprc_ehr.dataentry.forms.BloodDraws.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

public class DrugAdministrationFormSection extends SimpleFormSection {
    public DrugAdministrationFormSection() {
        super("study", "Drug Administration", "Treatments", "ehr-gridpanel");

        this.addConfigSource("Task");
    }
}
