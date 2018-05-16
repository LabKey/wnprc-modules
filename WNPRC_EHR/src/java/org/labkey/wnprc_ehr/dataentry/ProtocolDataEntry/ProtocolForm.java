package org.labkey.wnprc_ehr.dataentry.ProtocolDataEntry;


import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
//import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;

import java.util.Arrays;

/**
 * Created by fdnicolalde on 7/25/16.
 */
public class ProtocolForm extends AbstractDataEntryForm
{
    public static final String NAME = "protocol";

    public ProtocolForm(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "New Enter/Manage Protocols", WNPRCConstants.DataEntrySections.COLONY_RECORDS, Arrays.asList());
        updateProtocol protocolSection = new updateProtocol();
        this.addSection(protocolSection);

        for(ClientDependency dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }
        for (FormSection s: getFormSections()){
            s.addConfigSource("Default");
        }

        this.addClientDependency(ClientDependency.fromPath("wnprc_ehr/model/sources/Default.js"));

    }

    public class updateProtocol extends SimpleFormSection
    {

        public updateProtocol()
        {
            super("ehr", "protocol", "Enter Protocol Information", "ehr-protocoleditorgridpanel", EHRService.FORM_SECTION_LOCATION.Body);
            this.addConfigSource("Default");
            addClientDependency(ClientDependency.fromPath("wnprc_ehr/ext4/components/plugins/ProtocolRowEditor.js"));
            addClientDependency(ClientDependency.fromPath("wnprc_ehr/ext4/panel/ProtocolEditorGridPanel.js"));
            _allowRowEditing = true;

            /*fieldNamesAtStartInOrder = Arrays.asList(
                    "protocol",
                    "title",
                    "inves"

            );*/
        }

    }

}
