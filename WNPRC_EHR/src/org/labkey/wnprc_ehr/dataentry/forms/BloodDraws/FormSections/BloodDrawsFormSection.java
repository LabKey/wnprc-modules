package org.labkey.wnprc_ehr.dataentry.forms.BloodDraws.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

public class BloodDrawsFormSection extends SimpleFormSection {
    public BloodDrawsFormSection() {
        super("study", "Blood Draws", "Blood Draws", "ehr-gridpanel");

        this.addConfigSource("Task");
        setClientStoreClass("EHR.data.BloodDrawClientStore");
        addClientDependency(ClientDependency.supplierFromPath("ehr/window/AddScheduledBloodDrawsWindow.js"));
        addClientDependency(ClientDependency.supplierFromPath("ehr/data/BloodDrawClientStore.js"));
    }
}
