package org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

/**
 * Created by jon on 10/7/15.
 */
public class HeaderSection extends SimpleFormSection {
    public HeaderSection() {
        super("study", "Clinical Encounters", "Header", "ehr-gridpanel");
    }
}
