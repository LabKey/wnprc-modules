package org.labkey.wnprc_ehr.dataentry.forms.Surgery;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections.ChargesSection;
import org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections.ClinicalRemarksSection;
import org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections.EncounterDetailsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections.FinalReportsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections.TreatmentsAndProceduresSection;
import org.labkey.wnprc_ehr.dataentry.forms.Surgery.FormSections.WeightSection;

import java.util.Arrays;

public class SurgeryForm extends TaskForm {
    public static final String NAME = "Surgery";

    public SurgeryForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Surgery", WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new EncounterDetailsSection(),
                new AnimalDetailsFormSection(),
                new TreatmentsAndProceduresSection(),
                new WeightSection(),
                new ClinicalRemarksSection(),
                new ChargesSection(),
                new FinalReportsSection()
        ));

        for(FormSection section : this.getFormSections()) {
            section.addConfigSource("Task");
            section.addConfigSource("Encounter");
            section.addConfigSource("Surgery");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Encounter.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Surgery.js"));
    }
}
