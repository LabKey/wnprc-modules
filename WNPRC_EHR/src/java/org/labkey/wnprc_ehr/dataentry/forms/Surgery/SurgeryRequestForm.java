package org.labkey.wnprc_ehr.dataentry.forms.Surgery;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.RequestFormSection;
import org.labkey.api.ehr.dataentry.SimpleFormPanelSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections.SurgeryRequestSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleRequestForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.AnimalDetailsPanel;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SurgeryRequestForm extends SimpleRequestForm
{

    public static final String NAME = "SurgeryRequest";

    public SurgeryRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Request Surgery", WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.<FormSection>asList(
                new RequestFormSection(),
                new SurgeryRequestSection(),
                //new SimpleFormPanelSection("wnprc", "surgeries", "Surgery Request"),
                new AnimalDetailsPanel()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("SurgeryRequest");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/SurgeryRequest.js"));
    }

    @Override
    protected List<String> getButtonConfigs() {
        List<String> buttons = new ArrayList<>();
        buttons.addAll(super.getButtonConfigs());

        buttons.remove("REQUEST");
        buttons.add("WNPRC_REQUEST");

        return buttons;
    }
}
