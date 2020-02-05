package org.labkey.wnprc_billing.dataentry;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr_billing.security.EHR_BillingAdminPermission;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class AbstractMiscChargesFormType extends TaskForm
{
    public AbstractMiscChargesFormType(DataEntryFormContext ctx, Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(ctx, owner, name, label, category, sections);

        addClientDependency(ClientDependency.fromPath("ehr_billing/model/sources/Charges.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/buttons/financeButtons.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/DataEntryUtils.js"));
        addClientDependency(ClientDependency.fromPath("ehr/DataEntryUtils.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/form/field/EHRBillingProjectField.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/form/field/EHRBillingProjectEntryField.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/form/field/EHRBillingRowObserverEntryField.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/form/field/WNPRC_BillingProjectEntryField.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/form/field/ChargeItemField.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/form/field/InvestigatorField.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/form/field/MiscChargesDateField.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/form/field/ChargeGroupField.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/data/sources/EHR_BillingDefault.js"));
        addClientDependency(ClientDependency.fromPath("wnprc_billing/form/field/MiscChargesDebitAcctEntryField.js"));

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