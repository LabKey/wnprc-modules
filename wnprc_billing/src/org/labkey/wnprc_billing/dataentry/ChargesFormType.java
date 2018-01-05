package org.labkey.wnprc_billing.dataentry;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.api.ehr_billing.security.EHR_BillingAdminPermission;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ChargesFormType extends TaskForm
{
    public static final String NAME = "Charges";

    public ChargesFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "Charges", "Billing", Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new ChargesFormSection()
        ));

        addClientDependency(ClientDependency.fromPath("ehr_billing/model/sources/Charges.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/buttons/financeButtons.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/DataEntryUtils.js"));
        addClientDependency(ClientDependency.fromPath("ehr/DataEntryUtils.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/form/field/EHRBillingProjectField.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/form/field/EHRBillingProjectEntryField.js"));
        addClientDependency(ClientDependency.fromPath("ehr_billing/form/field/EHRBillingChargeIdEntryField.js"));

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("Charges");
        }
    }

    @Override
    public boolean isVisible()
    {
        return false;
    }

//    @Override
//    protected List<String> getMoreActionButtonConfigs()
//    {
//        List<String> defaultButtons = super.getMoreActionButtonConfigs();
//        defaultButtons.add("FINANCESUBMIT");
//
//        return defaultButtons;
//    }
//    @Override
//    protected List<String> getButtonConfigs()
//    {
//        List<String> defaultButtons = new ArrayList<String>();
//        defaultButtons.add("FINANCESUBMIT");
//
//        return defaultButtons;
//    }
//
//    @Override
//    protected List<String> getMoreActionButtonConfigs()
//    {
//        return Collections.emptyList();
//    }

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