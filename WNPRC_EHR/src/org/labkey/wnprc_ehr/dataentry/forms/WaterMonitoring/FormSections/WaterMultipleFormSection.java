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

public class WaterMultipleFormSection extends SimpleGridSection
{
    public WaterMultipleFormSection (){

        super("study", "watergiven", "Water Given");
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
        setAllowBulkAdd(true);

        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/windows/AddScheduleWaterWindow.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/buttons/husbandryButtons.js"));

        _showLocation = true;
        setAllowBulkAdd(false);
        setTemplateMode(TEMPLATE_MODE.NONE);
       // _templateMode = TEMPLATE_MODE.NONE;


    }
    @Override
    public List<String> getTbarButtons(){

        List<String> defaultButtons = super.getTbarButtons();

        defaultButtons.add(0,"ADDSCHEDULEDWATERS");
        defaultButtons.add(1,"CHANGETIME");
        //TODO: remove add button from the form.
        //defaultButtons.remove("ADDRECORD");
       
        return defaultButtons;
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = new ArrayList<>();
        defaultButtons.addAll(super.getTbarMoreActionButtons());
        defaultButtons.remove("COPY_IDS");
        return defaultButtons;
    }
}
