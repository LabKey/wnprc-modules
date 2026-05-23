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

import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WaterSingleDayApprenticeSection extends SlaveGridSection
{
    public WaterSingleDayApprenticeSection(){
        super ("study", "waterAmount", "Order Additional Water for Today");
        setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterApprenticeSectionClientStore");
       // setAllowBulkAdd(true);
    }
    public WaterSingleDayApprenticeSection(String title){
        super ("study", "waterAmount", title);
        this.addConfigSource("WNPRC_Request");
        //setClientStoreClass("WNPRC.ext.data.SingleAnimal.WaterClientStore");
        // setAllowBulkAdd(true);
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
        return Arrays.asList("Id", "date", "volume", "assignedTo", "project","frequency","recordSource","waterSource","provideFruit");
    }
}
