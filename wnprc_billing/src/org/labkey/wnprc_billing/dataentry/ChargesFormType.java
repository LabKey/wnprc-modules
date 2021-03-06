package org.labkey.wnprc_billing.dataentry;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;

import java.util.Arrays;

/**
 * Data entry form setup to administer three sections/Ext4JS components - Task, Animal Details, and Misc Charges.
 */
public class ChargesFormType extends AbstractMiscChargesFormType
{
    public static final String NAME = "Charges";

    public ChargesFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "Enter Charges with Animal Ids", "Billing", Arrays.asList(
                new TaskFormSection(),
                new WNPRC_BillingAnimalDetailsFormSection(),
                new ChargesFormSection()
        ));

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("Charges");
            s.addConfigSource("MiscCharges");
        }
    }
}