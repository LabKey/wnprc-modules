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
import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WaterDrugAdministrationSection extends SlaveGridSection
{
    public WaterDrugAdministrationSection(){
        super ("study", "drug", "Implant Maintenance");
        //setClientStoreClass("EHR.data.DrugAdministrationRunsClientStore");
        //addClientDependency(ClientDependency.fromPath("ehr/data/DrugAdministrationRunsClientStore.js"));
        addClientDependency(ClientDependency.supplierFromPath("ehr/form/field/SnomedCombo.js"));
        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
       // setAllowBulkAdd(true);
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/buttons/husbandryButtons.js"));
    }
    public WaterDrugAdministrationSection(String title){
        super ("study", "drug", title);
        //this.addConfigSource("WNPRC_Request");
        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
        // setAllowBulkAdd(true);
    }
    @Override
    public List<String> getTbarButtons(){

        List<String> defaultButtons = super.getTbarButtons();
        defaultButtons.add(1,"CHANGETIME");

        return defaultButtons;
    }
    @Override
    public Set<String> getSlaveFields(){
        Set<String> fields = new HashSet<>();
        fields.add("Id");
        fields.add("project");
        return fields;
    }
    @Override
    public List<String> getFieldNames(){
        return Arrays.asList("Id","project","date","category","code","areaCleaned","route","remark");
    }
}
