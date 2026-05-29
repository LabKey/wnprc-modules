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
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.Instructions;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.NecropsyRequestInfoSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.NoticeSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.OrganWeightsSection;
import org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections.TissueSamplesSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleRequestForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.AnimalDetailsPanel;
import org.labkey.wnprc_ehr.dataentry.generics.sections.ShortenedRequestFormSection;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Created by jon on 3/4/16.
 */
/**
 * Created by jon on 3/4/16.
 */
public class NecropsyRequestForm extends SimpleRequestForm {
    public static final String NAME = "NecropsyRequest";

    public NecropsyRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Request Necropsy", WNPRCConstants.DataEntrySections.PATHOLOGY_CLINPATH, Arrays.asList(
                new NoticeSection(),
                new ShortenedRequestFormSection(),
                new Instructions(),
                new NecropsyRequestInfoSection(),
                new AnimalDetailsPanel(),
                new TissueSamplesSection(),
                new OrganWeightsSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Necropsy");
            section.addConfigSource("NecropsyRequest");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/NecropsyRequest.js"));
        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Pathology.js"));
    }

    @Override
    protected List<String> getButtonConfigs() {
        List<String> buttons = new ArrayList<>();
        buttons.addAll(super.getButtonConfigs());

        buttons.remove("REQUEST");
        buttons.add("WNPRC_SAVE");
        buttons.add("WNPRC_REQUEST");

        return buttons;
    }
}