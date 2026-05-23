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
package org.labkey.wnprc_ehr.dataentry.generics.forms;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

/**
 * Created by jon on 3/1/16.
 */
public class SimpleTaskForm extends TaskForm {
    protected SimpleTaskForm(DataEntryFormContext ctx, Module owner, String name, String label, String category, List<FormSection> sections) {
        super(ctx, owner, name, label, category, sections);

        setJavascriptClass("WNPRC.ext.panel.TaskDataEntryPanel");
        setStoreCollectionClass("WNPRC.ext.data.TaskStoreCollection");

        for(Supplier<ClientDependency> dependency : WNPRC_EHRModule.getDataEntryClientDependencies()) {
            this.addClientDependency(dependency);
        }
    }

    @Override
    protected List<String> getButtonConfigs() {
        List<String> defaultButtons = new ArrayList<String>();

        defaultButtons.add("WNPRC_CANCEL");
        defaultButtons.add("WNPRC_SAVE");
        defaultButtons.add("WNPRC_SAVE_AND_EXIT");

        return defaultButtons;
    }

    @Override
    protected List<String> getMoreActionButtonConfigs() {
        List<String> defaultButtons = new ArrayList<String>();

        defaultButtons.add("WNPRC_FIX_QCSTATE");
        defaultButtons.add("DISCARD");
        defaultButtons.add("FORCESUBMIT");
        defaultButtons.add("VALIDATEALL");
        defaultButtons.add("REVIEW");
        defaultButtons.add("WNPRC_START_TASK");
        defaultButtons.add("WNPRC_SUBMIT_FINAL");
        defaultButtons.add("WNPRC_SAVE_AS_SCHEDULED");

        return defaultButtons;
    }
}
