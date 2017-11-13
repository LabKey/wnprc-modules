package org.labkey.wnprc_ehr.dataentry.forms.Housing;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRCConstants;

import java.util.Arrays;

public class HousingForm extends TaskForm {
    public static final String NAME = "Housing";

    public HousingForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter Housing Change", WNPRCConstants.DataEntrySections.BEHAVIOR_COLONY_MGMT, Arrays.<FormSection>asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection()
        ));
    }
}
