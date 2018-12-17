package org.labkey.wnprc_ehr.dataentry.forms.ProblemList;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.ProblemList.FormSections.ProblemListSection;

import java.util.Arrays;

public class ProblemListForm extends TaskForm {
    public static final String NAME = "Problem List";

    public ProblemListForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Problem", WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new ProblemListSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
        }
    }
}
