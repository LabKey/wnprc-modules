package org.labkey.wnprc_ehr.dataentry.forms.TreatmentOrders;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.TreatmentOrders.FormSections.TreatmentOrdersSection;

import java.util.Arrays;

public class TreatmentOrdersForm extends TaskForm {
    public static final String NAME = "Treatment Orders";

    public TreatmentOrdersForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Treatment Orders", WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new TreatmentOrdersSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
            section.addConfigSource("Treatments");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Treatments.js"));
    }
}
