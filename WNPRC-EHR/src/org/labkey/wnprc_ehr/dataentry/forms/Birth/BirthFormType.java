package org.labkey.wnprc_ehr.dataentry.forms.Birth;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Birth.FormSections.BirthFormSection;

import java.util.Arrays;

public class BirthFormType extends TaskForm {
    public static final String NAME = "Birth";

    public BirthFormType(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.COLONY_RECORDS, Arrays.<FormSection>asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new BirthFormSection()
        ));
    }
}
