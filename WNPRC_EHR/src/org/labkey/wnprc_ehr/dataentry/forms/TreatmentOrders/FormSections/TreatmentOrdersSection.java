package org.labkey.wnprc_ehr.dataentry.forms.TreatmentOrders.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

import java.util.List;

public class TreatmentOrdersSection extends SimpleFormSection {
    //boolean _isRequest = false;
    protected boolean _showAddTreatments = true;



    public TreatmentOrdersSection() {

        super("study", "Treatment Orders", "Treatments", "ehr-gridpanel");
        addClientDependency(ClientDependency.supplierFromPath("ehr/window/AddScheduledTreatmentWindow.js"));

    }
    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = super.getTbarMoreActionButtons();
        defaultButtons.add("REPEAT_SELECTED");

        if (_showAddTreatments)
            defaultButtons.add("ADDTREATMENTS");

        return defaultButtons;
    }
}
