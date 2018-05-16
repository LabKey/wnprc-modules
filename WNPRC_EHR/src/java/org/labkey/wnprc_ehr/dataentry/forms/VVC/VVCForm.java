package org.labkey.wnprc_ehr.dataentry.forms.VVC;

import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.VVC.FormSections.VVCInfoSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.TaskFormSection;

import java.util.Arrays;

public class VVCForm extends SimpleTaskForm{
    public static final String NAME ="VVC";

    public VVCForm(DataEntryFormContext ctx, Module owner){
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new VVCInfoSection()
        ));

    }
}
