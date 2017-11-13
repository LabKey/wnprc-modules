package org.labkey.wnprc_ehr.dataentry.forms.Assignment;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Assignment.FormSections.AssignmentSection;

import java.util.Arrays;

public class AssignmentForm extends TaskForm {
    public static final String NAME = "Assignment";

    public AssignmentForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter/Manage Assignments", WNPRCConstants.DataEntrySections.COLONY_RECORDS, Arrays.<FormSection>asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new AssignmentSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
        }
    }
}
