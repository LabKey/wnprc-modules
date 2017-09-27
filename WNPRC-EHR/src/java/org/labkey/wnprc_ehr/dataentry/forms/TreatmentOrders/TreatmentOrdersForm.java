package org.labkey.wnprc_ehr.dataentry.forms.TreatmentOrders;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;

import java.util.Arrays;

public class TreatmentOrdersForm extends TaskForm {
    public static final String NAME = "Treatment Orders";

    public TreatmentOrdersForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Treatment Orders", WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.<FormSection>asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
            section.addConfigSource("Treatments");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Treatments.js"));
    }
}
