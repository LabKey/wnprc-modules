package org.labkey.wnprc_ehr.dataentry.forms.Treatments;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Treatments.FormSections.TreatmentsSection;

import java.util.Arrays;

public class TreatmentsForm extends TaskForm {
    public static final String NAME = "Treatments";

    public TreatmentsForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Treatments", WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new TreatmentsSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
            section.addConfigSource("Treatments");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Treatments.js"));
    }


}
