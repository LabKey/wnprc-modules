package org.labkey.wnprc_billing.dataentry;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collections;
import java.util.List;

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
        _allowRowEditing = false;

        addClientDependency(ClientDependency.fromPath("wnprc_billing/model/sources/NonAnimalCharges.js"));

        setConfigSources(Collections.singletonList("Task"));
    }

    @Override
    public List<String> getTbarButtons()
    {
        List<String> defaultButtons = super.getTbarButtons();

        // Remove the default buttons that don't make sense for charges Without animal ids
        defaultButtons.remove("ADDANIMALS");
        defaultButtons.remove("COPYFROMSECTION");
        defaultButtons.remove("TEMPLATE");

        return defaultButtons;
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultMoreActionButtons = super.getTbarMoreActionButtons();
        defaultMoreActionButtons.remove("GUESSPROJECT");
        defaultMoreActionButtons.remove("COPY_IDS");
        return defaultMoreActionButtons;
    }
}
