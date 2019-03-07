package org.labkey.wnprc_ehr.dataentry.forms.TBTests;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.TBTests.FormSections.TBTestsSection;

import java.util.Arrays;

public class TBTestsForm extends TaskForm {
    public static final String NAME = "TB Tests";

    public TBTestsForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter TB Tests", WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new TBTestsSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
        }
    }
}
