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
package org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.FormSections.AlopeciaSection;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.FormSections.BodyConditionSection;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.FormSections.ChargesSection;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.FormSections.ClinicalRemarksSection;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.FormSections.DentalStatusSection;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.FormSections.HeaderSection;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.FormSections.PEFindingsSection;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.FormSections.TeethSection;
import org.labkey.wnprc_ehr.dataentry.forms.PhysicalExam.FormSections.VitalsSection;

import java.util.Arrays;

public abstract class PhysicalExamForm extends TaskForm {
    public PhysicalExamForm(DataEntryFormContext ctx, Module owner, String name) {
        super(ctx, owner, name, name, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new HeaderSection(),
                new AnimalDetailsFormSection(),
                new VitalsSection(),
                new DentalStatusSection(),
                new TeethSection(),
                new BodyConditionSection(),
                new AlopeciaSection(),
                new PEFindingsSection(),
                new ClinicalRemarksSection(),
                new ChargesSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
            section.addConfigSource("Encounter");
            section.addConfigSource("PhysicalExam");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Encounter.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/PhysicalExam.js"));
    }
}
