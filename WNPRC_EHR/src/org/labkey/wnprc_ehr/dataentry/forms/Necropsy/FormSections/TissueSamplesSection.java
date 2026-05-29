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

import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveGridSection;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class TissueSamplesSection extends SlaveGridSection {
    public TissueSamplesSection() {
        super("study", "Tissue Samples", "Tissue Samples");
    }

    @Override
    public List<String> getFieldNames() {
        return Arrays.asList(
                "lab_sample_id",
                "collection_order",
                "collect_before_death",
                "tissue",
                "qualifier",
                "preservation",
                "container_type",
                "quantity",
                "stain",
                "recipient",
                "ship_to",
                "accountToCharge",
                "tissueRemarks",
                "ship_to_comment",
                "pathologist",
                "trimdate",
                "trimmed_by",
                "trim_remarks",
                "slideNum",
                "Id",
                "date"
        );
    }

    @Override
    public Set<String> getSlaveFields() {
        Set<String> fields = new HashSet<>();

        fields.add("Id");
        fields.add("date");

        return fields;
    }

    @Override
    public List<String> getTbarButtons() {
        List<String> defaultButtons = new ArrayList<>();
        defaultButtons.addAll(super.getTbarButtons());

        defaultButtons.add("WNPRC_AUTO_ASSIGN_ORDER");

        return defaultButtons;
    }
}
