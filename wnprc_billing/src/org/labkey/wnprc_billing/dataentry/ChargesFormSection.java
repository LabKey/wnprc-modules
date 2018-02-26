package org.labkey.wnprc_billing.dataentry;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collections;

/**
 * Class to administer Ext4JS component/panel for ehr_billing.miscCharges table for data entry form.
 */
public class ChargesFormSection extends SimpleFormSection
{
    public ChargesFormSection()
    {
        this(EHRService.FORM_SECTION_LOCATION.Body);
    }

    public ChargesFormSection(EHRService.FORM_SECTION_LOCATION location)
    {
        super("ehr_billing", "miscCharges", "Misc. Charges", "ehr-gridpanel", location);
        setConfigSources(Collections.singletonList("Task"));
//        setClientStoreClass("EHR_Billing.data.MiscChargesClientStore");
//        addClientDependency(ClientDependency.fromPath("ehr_billing/data/MiscChargesClientStore.js"));
    }
}