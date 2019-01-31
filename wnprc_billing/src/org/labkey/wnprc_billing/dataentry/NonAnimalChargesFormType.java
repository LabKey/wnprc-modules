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

public class NonAnimalChargesFormType extends TaskForm {

    public NonAnimalChargesFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, "NonAnimalCharges", "Enter Charges without Animal Ids", "Billing", Arrays.asList(
                new TaskFormSection(),
                new NonAnimalChargesFormSection()
        ));

        addClientDependency(ClientDependency.fromPath("ehr_billing/buttons/financeButtons.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/DataEntryUtils.js"));
        addClientDependency(ClientDependency.fromPath("ehr/DataEntryUtils.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/form/field/EHRBillingRowObserverEntryField.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/model/sources/NonAnimalCharges.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/form/field/ChargeItemField.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/form/field/MiscChargesDateField.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/form/field/ChargeTypeField.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/form/field/MiscChargesDebitAcctEntryField.js"));

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("NonAnimalCharges");
        }
    }

    @Override
    public boolean isVisible()
    {
        return false;
    }

    @Override
    protected List<String> getButtonConfigs()
    {
        List<String> defaultButtons = new ArrayList<String>();
        defaultButtons.add("FINANCESUBMIT");

        return defaultButtons;
    }

    @Override
    protected List<String> getMoreActionButtonConfigs()
    {
        return Collections.emptyList();
    }

    @Override
    public boolean canInsert()
    {
        if (!getCtx().getContainer().hasPermission(getCtx().getUser(), EHR_BillingAdminPermission.class))
            return false;

        return super.canInsert();
    }

    @Override
    public boolean canRead()
    {
        if (!getCtx().getContainer().hasPermission(getCtx().getUser(), EHR_BillingAdminPermission.class))
            return false;

        return super.canRead();
    }
}
