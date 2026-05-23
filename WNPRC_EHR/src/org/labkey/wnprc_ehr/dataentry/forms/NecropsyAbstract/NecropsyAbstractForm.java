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
package org.labkey.wnprc_ehr.dataentry.forms.NecropsyAbstract;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.dataentry.forms.NecropsyAbstract.FormSections.NecropsyAbstractFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;

import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;

public class NecropsyAbstractForm extends SimpleTaskForm
{
    public static final String NAME = "Necropsy Abstract";

    public NecropsyAbstractForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter " + NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                /*this task form is required?*/
                new TaskFormSection(),
                /*new AnimalDetailsFormSection(),*/
                new NecropsyAbstractFormSection(NAME)
        ));


        for(Supplier<ClientDependency> dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }


        //setStoreCollectionClass("EHR.data.NecropsyAbstractStore");
    }
    @Override
    protected List<String> getButtonConfigs()
    {
        List<String> ret = super.getButtonConfigs();
        //this is actually submit final, and puts the QC state into Completed
        ret.add("WNPRC_SUBMIT_FINAL");

        return ret;

    }

}
