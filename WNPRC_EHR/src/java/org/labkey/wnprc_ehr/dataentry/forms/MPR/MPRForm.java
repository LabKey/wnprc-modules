package org.labkey.wnprc_ehr.dataentry.forms.MPR;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.MPR.FormSections.ChargesSection;
import org.labkey.wnprc_ehr.dataentry.forms.MPR.FormSections.EncounterDetailsSection;
import org.labkey.wnprc_ehr.dataentry.forms.MPR.FormSections.TreatmentsAndProceduresSection;
import org.labkey.wnprc_ehr.dataentry.forms.MPR.FormSections.WeightSection;

import java.util.Arrays;

public class MPRForm extends TaskForm {
    public static final String NAME = "MPR";

    public MPRForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter MPR", WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new EncounterDetailsSection(),
                new AnimalDetailsFormSection(),
                new TreatmentsAndProceduresSection(),
                new WeightSection(),
                new ChargesSection()
        ));

        for(FormSection section : this.getFormSections()) {
            section.addConfigSource("Task");
            section.addConfigSource("Encounter");
            section.addConfigSource("MPR");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Encounter.js"));
        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/MPR.js"));
    }
}
