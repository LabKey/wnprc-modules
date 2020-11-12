package org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.RequestFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections.SurgeryProcedureMultipleRequestSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleRequestForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.AnimalDetailsPanel;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SurgeryProcedureMultipleRequestForm extends SimpleRequestForm
{

    public static final String NAME = "SurgeryProcedureMultipleRequest";

    public SurgeryProcedureMultipleRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Request Multiple Surgeries and Procedures", WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.<FormSection>asList(
                new RequestFormSection(),
                new SurgeryProcedureMultipleRequestSection(),
                new AnimalDetailsPanel()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("SurgeryProcedureMultipleRequest");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/SurgeryProcedureMultipleRequest.js"));
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
