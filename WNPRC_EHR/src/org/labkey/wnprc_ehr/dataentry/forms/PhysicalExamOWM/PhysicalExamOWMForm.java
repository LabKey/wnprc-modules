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
package org.labkey.wnprc_ehr.dataentry.forms.PhysicalExamOWM;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.PhysicalExamForm;

public class PhysicalExamOWMForm extends PhysicalExamForm {
    public PhysicalExamOWMForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, "Physical Exam OWM");

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("PhysicalExamOWM");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/PhysicalExamOWM.js"));
    }
}
