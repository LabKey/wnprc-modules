package org.labkey.wnprc_ehr.dataentry.forms.BloodDrawRequest.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

public class BloodDrawRequestFormSection extends SimpleFormSection {
    public BloodDrawRequestFormSection() {
        super("study", "Blood Draws", "Blood Draws", "ehr-gridpanel");

        this.addConfigSource("Request");
    }
}
