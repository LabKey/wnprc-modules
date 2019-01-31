package org.labkey.wnprc_billing.dataentry;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collections;

/**
 * Class to administer Ext4JS component/panel for ehr_billing.miscCharges data entry for charges without animal id and project
 */
public class NonAnimalChargesFormSection extends SimpleFormSection {

    public NonAnimalChargesFormSection()
    {
        this(EHRService.FORM_SECTION_LOCATION.Body);
    }

    public NonAnimalChargesFormSection(EHRService.FORM_SECTION_LOCATION location)
    {
        super("ehr_billing", "miscCharges", "Misc. Charges", "ehr-gridpanel", location);
        setConfigSources(Collections.singletonList("Task"));

        addClientDependency(ClientDependency.fromPath("ehr_billing/form/field/EHRBillingRowObserverEntryField.js"));

    }
}
