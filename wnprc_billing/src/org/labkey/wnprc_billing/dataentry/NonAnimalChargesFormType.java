package org.labkey.wnprc_billing.dataentry;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.ehr_billing.security.EHR_BillingAdminPermission;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class NonAnimalChargesFormType extends AbstractMiscChargesFormType {

    public NonAnimalChargesFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, "NonAnimalCharges", "Enter Charges without Animal Ids", "Billing", Arrays.asList(
                new TaskFormSection(),
                new NonAnimalChargesFormSection()
        ));

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("Charges");
            s.addConfigSource("NonAnimalCharges");
        }
    }
}
