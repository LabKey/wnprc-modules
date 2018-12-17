package org.labkey.wnprc_ehr.dataentry.forms.IrregularObservations.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

public class ObservationsPerCageSection extends SimpleFormSection {
    public ObservationsPerCageSection() {
        super("ehr", "cage_observations", "Observations Per Cage", "ehr-gridpanel");
    }
}
