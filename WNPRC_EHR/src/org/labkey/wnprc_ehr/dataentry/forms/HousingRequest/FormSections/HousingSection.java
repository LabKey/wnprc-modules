package org.labkey.wnprc_ehr.dataentry.forms.HousingRequest.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

public class HousingSection extends SimpleFormSection {
    public HousingSection() {
        super("study", "Housing", "Housing", "ehr-gridpanel");

        this.addConfigSource("Request");
    }
}
