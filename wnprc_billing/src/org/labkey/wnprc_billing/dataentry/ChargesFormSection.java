package org.labkey.wnprc_billing.dataentry;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collections;
import java.util.List;

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
        _allowRowEditing = false;

        addClientDependency(ClientDependency.fromPath("wnprc_billing/model/sources/MiscCharges.js"));

        setConfigSources(Collections.singletonList("Task"));
    }

    @Override
    public List<String> getTbarButtons()
    {
        List<String> defaultButtons = super.getTbarButtons();

        // Remove the default buttons that don't make sense for charges with animal ids
        defaultButtons.remove("COPYFROMSECTION");
        defaultButtons.remove("TEMPLATE");
        defaultButtons.remove("ADDANIMALS");
        defaultButtons.add(1, "ADDANIMALS_BULK_DISABLED");

        return defaultButtons;
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultMoreActionButtons = super.getTbarMoreActionButtons();
        defaultMoreActionButtons.remove("BULKEDIT");
        return defaultMoreActionButtons;
    }
}