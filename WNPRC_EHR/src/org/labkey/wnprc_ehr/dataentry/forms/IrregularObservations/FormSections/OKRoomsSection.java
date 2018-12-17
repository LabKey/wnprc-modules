package org.labkey.wnprc_ehr.dataentry.forms.IrregularObservations.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;

public class OKRoomsSection extends SimpleFormSection {
    public OKRoomsSection() {
        super("ehr", "cage_observations", "OK Rooms", "ehr-gridpanel");
        this.addConfigSource("IrregularObs_OKRooms");
    }
}
