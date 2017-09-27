package org.labkey.wnprc_ehr.dataentry.forms.BehaviorAbstract;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.BehaviorAbstract.FormSections.BehaviorAbstractSection;

import java.util.Arrays;

public class BehaviorAbstractForm extends TaskForm {
    public static final String NAME = "Behavior Abstract";

    public BehaviorAbstractForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Behavior Abstract", WNPRCConstants.DataEntrySections.BEHAVIOR_COLONY_MGMT, Arrays.<FormSection>asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new BehaviorAbstractSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
        }
    }
}
