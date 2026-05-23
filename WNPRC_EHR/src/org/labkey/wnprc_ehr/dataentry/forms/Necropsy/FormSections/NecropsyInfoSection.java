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
package org.labkey.wnprc_ehr.dataentry.forms.Necropsy.FormSections;

import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleFormSection;

import java.util.Arrays;

public class NecropsyInfoSection extends SimpleFormSection {
    public NecropsyInfoSection() {
        super("study", "Necropsies", "Necropsies");
        setTemplateMode(TEMPLATE_MODE.NONE);

        fieldNamesAtStartInOrder = Arrays.asList(
                "Id",
                "date",
                "is_prenatal_necropsy",
                "dam",
                "project",
                "account",
                "tattoo",
                "caseno",
                "location",
                "performedby",
                "pathologistHistology",
                "pathologistReview",
                "assistant",
                "billing",
                "tissue_distribution",
                "timeofdeath",
                "causeofdeath",
                "mannerofdeath",
                "perfusion_area",
                "perfusion_soln1",
                "perfusion_soln2"
        );

        fieldNamesAtEndInOrder = Arrays.asList(
                "grossdescription",
                "histologicalDescription",
                "remark",
                "patho_notes",
                "comments"
        );

        maxItemsPerColumn = 18;

        setClientStoreClass("WNPRC.ext.data.SingleAnimal.NecropsyClientStore");
    }
}