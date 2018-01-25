package org.labkey.wnprc_ehr.dataentry.forms.Clinpath.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

public class AbstractClinpathSection extends SimpleFormSection {
    public AbstractClinpathSection(String queryName) {
        super("study", queryName, queryName, "ehr-gridpanel");

        this.addConfigSource("Task");
        this.addConfigSource("Assay");
    }
}
