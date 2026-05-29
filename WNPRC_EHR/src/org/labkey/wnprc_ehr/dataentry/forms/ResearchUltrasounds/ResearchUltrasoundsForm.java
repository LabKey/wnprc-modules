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
package org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections.ResearchUltrasoundsFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections.ResearchUltrasoundsInstructionsFormSection;
import org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections.ResearchUltrasoundsRestraintsFormSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ResearchUltrasoundsForm extends SimpleTaskForm
{
    public static final String NAME = "Research Ultrasounds";

    public ResearchUltrasoundsForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
            new TaskFormSection(),
            new AnimalDetailsFormSection(),
            new ResearchUltrasoundsInstructionsFormSection(),
            new ResearchUltrasoundsFormSection(),
            new ResearchUltrasoundsRestraintsFormSection()
        ));

        for (FormSection section: getFormSections()) {
            section.addConfigSource("ResearchUltrasounds");
        }

        setStoreCollectionClass("WNPRC.ext.data.ResearchUltrasoundsStoreCollection");
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/ResearchUltrasounds.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/data/SingleAnimal/ResearchUltrasoundsServerStore.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/data/SingleAnimal/ResearchUltrasoundsStoreCollection.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/fields/PregnancyIdField.js"));

        setDisplayReviewRequired(true);
    }

    @Override
    protected List<String> getButtonConfigs()
    {
        List<String> defaultButtons = new ArrayList<>();
        defaultButtons.add("WNPRC_CANCEL");
        defaultButtons.add("WNPRC_REVIEW");
        return defaultButtons;
    }

    @Override
    protected List<String> getMoreActionButtonConfigs() {
        List<String> defaultButtons = new ArrayList<>();
        //defaultButtons.add("WNPRC_FIX_QCSTATE");
        //defaultButtons.add("DISCARD");
        defaultButtons.add("VALIDATEALL");
        return defaultButtons;
    }
}