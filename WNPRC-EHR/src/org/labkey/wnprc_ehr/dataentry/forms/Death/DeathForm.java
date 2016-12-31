package org.labkey.wnprc_ehr.dataentry.forms.Death;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Death.FormSections.DeathsSection;

import java.util.Arrays;

public class DeathForm extends TaskForm {
    public static final String NAME = "Death";

    public DeathForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Death Record", WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.<FormSection>asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new DeathsSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
        }
    }
}
