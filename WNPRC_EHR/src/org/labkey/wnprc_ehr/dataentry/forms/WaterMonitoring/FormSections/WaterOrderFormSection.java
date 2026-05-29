/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections;


import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.ArrayList;
import java.util.List;

public class WaterOrderFormSection extends SimpleGridSection
{
    public WaterOrderFormSection(){
        super ("study", "waterOrders", "Water Orders");
        /*fieldNamesAtStartInOrder = new ArrayList<>().addAll(Arrays.asList(
                "Id",
                "date",
                "enddate",
                "volume",
                "provideFruit"
        ));*/

        this.setAllowBulkAdd(true);
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/data/HusbandryClientStore.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/windows/AddWaterWindow.js"));
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
    }
    public WaterOrderFormSection(String sectionTitle){
        super ("study", "waterOrders", sectionTitle);
        this.setAllowBulkAdd(true);
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/data/HusbandryClientStore.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/windows/AddWaterWindow.js"));
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
    }
    public List<String> getTbarButtons(){
        List<String> defaultButtons = super.getTbarButtons();

        defaultButtons.add("ADDWATERS");
        defaultButtons.add("DUPLICATE");

        return defaultButtons;

    }
}
