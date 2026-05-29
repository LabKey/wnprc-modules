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
package org.labkey.wnprc_ehr.dataentry.forms.FoodDeprives;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.dataentry.forms.FoodDeprives.FormSections.FoodDeprivesFormSections;

import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;

public class FoodDepriveCompleteForm extends TaskForm
{
    public static final String NAME = "Food Deprive Complete";

    public FoodDepriveCompleteForm(DataEntryFormContext ctx, Module owner){
        super(ctx, owner, NAME, "Enter " + NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new FoodDeprivesFormSections(NAME)
        ));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Husbandry.js"));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Husbandry");
        }

        for(Supplier<ClientDependency> dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }

        setStoreCollectionClass("EHR.data.FoodDepriveStore");
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/data/foodDepriveStore.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/buttons/husbandryButtons.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/UWBoxSelect.css"));

    }
    @Override
    protected List<String> getButtonConfigs()
    {
        List<String> ret = super.getButtonConfigs();
        ret.remove("SAVEDRAFT");
        ret.remove("CLOSE");
        return ret;
    }

}
