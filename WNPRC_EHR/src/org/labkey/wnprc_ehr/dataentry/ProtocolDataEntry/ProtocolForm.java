/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
import java.util.function.Supplier;

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

        for(Supplier<ClientDependency> dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }
        for (FormSection s: getFormSections()){
            s.addConfigSource("Default");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Default.js"));

    }

    public static class updateProtocol extends SimpleFormSection
    {

        public updateProtocol()
        {
            super("ehr", "protocol", "Enter Protocol Information", "ehr-protocoleditorgridpanel", EHRService.FORM_SECTION_LOCATION.Body);
            this.addConfigSource("Default");
            addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/plugins/ProtocolRowEditor.js"));
            addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/panel/ProtocolEditorGridPanel.js"));
            _allowRowEditing = true;

            /*fieldNamesAtStartInOrder = Arrays.asList(
                    "protocol",
                    "title",
                    "inves"

            );*/
        }

    }

}
