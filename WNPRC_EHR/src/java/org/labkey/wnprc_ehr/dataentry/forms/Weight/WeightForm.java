package org.labkey.wnprc_ehr.dataentry.forms.Weight;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Weight.FormSections.WeightSection;

import java.util.Arrays;

public class WeightForm extends TaskForm {
    public static final String NAME = "Weight";

    public WeightForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Weights", WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new WeightSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
        }
    }
}
