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
package org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections.WaterOrderFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.TaskFormSection;


import java.util.Arrays;
import java.util.List;

public class EnterWaterOrder extends SimpleTaskForm
{
    public static final String NAME = "Enter Water Orders";

    public EnterWaterOrder(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME,  NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new WaterOrderFormSection()

        ));
        setStoreCollectionClass("WNPRC.ext.data.WaterStoreCollection");
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/WaterOrderTask.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("ehr/form/field/BooleanField.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/data/SingleAnimal/WaterServerStore.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/data/SingleAnimal/WaterStoreCollection.js"));

        for (FormSection section : this.getFormSections()){
            section.addConfigSource("WaterOrderTask");

        }

        // setStoreCollectionClass("EHR.data.WaterStore");
    }

    @Override
    protected List<String> getButtonConfigs(){
        List<String> buttons = super.getButtonConfigs();
        buttons.add("WNPRC_SUBMIT_FINAL");
        buttons.remove("WNPRC_SAVE");
        buttons.remove("WNPRC_SAVE_AND_EXIT");

        return buttons;

    }

}
