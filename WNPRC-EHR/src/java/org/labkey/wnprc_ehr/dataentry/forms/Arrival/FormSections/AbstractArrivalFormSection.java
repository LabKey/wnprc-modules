package org.labkey.wnprc_ehr.dataentry.forms.Arrival.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

public class AbstractArrivalFormSection extends SimpleFormSection {
    public AbstractArrivalFormSection(String queryName) {
        // The query name is the same as the title of the section.
        super("study", queryName, queryName, "ehr-gridpanel");

        this.addConfigSource("Task");
        this.addConfigSource("NewAnimal");
    }
}
