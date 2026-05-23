/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
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
import org.labkey.api.ehr.dataentry.RequestFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.WaterMonitoring.FormSections.WaterSingleDaySection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleRequestForm;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.TaskFormSection;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class EnterSingleDayWater extends SimpleTaskForm
{
    public static final String NAME = "Enter Single Day Water";

    public EnterSingleDayWater(DataEntryFormContext ctx, Module owner){
        super (ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new WaterSingleDaySection("Enter Single Day Water")
        ));

        for (FormSection section: this.getFormSections()){
            section.addConfigSource("Husbandry");
        }
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Husbandry.js"));

        //this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Request.js"));

    }

    @Override
    protected List<String> getButtonConfigs(){
        List<String> ret = new ArrayList<>();
        ret.addAll(super.getButtonConfigs());
        ret.remove("REQUEST");
        ret.add("SCHEDULE");

        return ret;
    }
}
