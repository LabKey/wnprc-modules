package org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.RequestFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections.SurgeryProcedureFoodDepriveSection;
import org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections.SurgeryProcedureInstructionsFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections.SurgeryProcedureRequestSection;
import org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections.SurgeryProcedureRoomsInstructionsFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.SurgeryProcedureRequest.FormSections.SurgeryProcedureRoomsSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleRequestForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.AnimalDetailsPanel;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SurgeryProcedureRequestForm extends SimpleRequestForm
{

    public static final String NAME = "SurgeryProcedureRequest";

    public SurgeryProcedureRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Request Surgery or Procedure", WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.asList(
                new SurgeryProcedureInstructionsFormSection(),
                new RequestFormSection(),
                new AnimalDetailsPanel(),
                new SurgeryProcedureRequestSection(),
                new SurgeryProcedureRoomsInstructionsFormSection(),
                new SurgeryProcedureRoomsSection(),
                new SurgeryProcedureFoodDepriveSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("SurgeryProcedureRequest");
        }

        setStoreCollectionClass("WNPRC.ext.data.SurgeryProcedureStoreCollection");
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/data/SingleAnimal/SurgeryProcedureServerStore.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/data/SingleAnimal/SurgeryProcedureStoreCollection.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/SurgeryProcedureRequest.js"));
    }

    @Override
    protected List<String> getButtonConfigs() {
        List<String> buttons = new ArrayList<>(super.getButtonConfigs());

        buttons.remove("REQUEST");
        buttons.add("ROOM_SCHEDULING_REQUEST");

        return buttons;
    }
}
