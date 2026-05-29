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
package org.labkey.wnprc_ehr.dataentry.forms.Necropsy;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.AlopeciaSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.BodyConditionSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.MorphologicDiagnosisSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.NecropsyInfoSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.OrganWeightsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.TissueSamplesSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.TreatmentsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.WeightSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.AnimalDetailsPanel;
import org.labkey.wnprc_ehr.dataentry.generics.sections.TaskFormSection;

import java.util.Arrays;
import java.util.List;

public class NecropsyForm extends SimpleTaskForm {
    public static final String NAME = "Necropsy";

    public NecropsyForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.asList(
                new TaskFormSection(),
                new NecropsyInfoSection(),
                new AnimalDetailsPanel(),
                new WeightSection(),
                new TreatmentsSection(),
                new BodyConditionSection(),
                new AlopeciaSection(),
                new TissueSamplesSection(),
                new OrganWeightsSection(),
                new MorphologicDiagnosisSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Necropsy");
            section.addConfigSource("NecropsyTask");
        }

        setStoreCollectionClass("WNPRC.ext.data.NecropsyStoreCollection");
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Necropsy.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Pathology.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/data/SingleAnimal/NecropsyServerStore.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/data/SingleAnimal/NecropsyStoreCollection.js"));
    }

    @Override
    protected List<String> getMoreActionButtonConfigs() {
        List<String> buttons = super.getMoreActionButtonConfigs();

        buttons.add("FINALIZE_DEATH");
        buttons.add("SEND_BACK_TO_REQUESTOR");
        buttons.add("UPDATE_DEATH");

        return buttons;
    }
}