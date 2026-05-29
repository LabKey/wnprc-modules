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
package org.labkey.wnprc_ehr.dataentry.forms.ResearchUltrasounds.FormSections;

import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveFormSection;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class UltrasoundReviewFormSection extends SlaveFormSection
{
    public UltrasoundReviewFormSection() {
        super("study", "ultrasound_review", "Ultrasound Review");
    }

    @Override
    public Set<String>  getSlaveFields() {
        Set<String> fields = new HashSet<>();
        fields.add("Id");
        return fields;
    }

    @Override
    protected List<String> getFieldNames() {
        List<String> fieldNames = new ArrayList<>();
        fieldNames.add("Id");
        fieldNames.add("date");
        fieldNames.add("head");
        fieldNames.add("falx");
        fieldNames.add("thalamus");
        fieldNames.add("lateral_ventricles");
        fieldNames.add("choroid_plexus");
        fieldNames.add("eye");
        fieldNames.add("profile");
        fieldNames.add("four_chamber_heart");
        fieldNames.add("diaphragm");
        fieldNames.add("stomach");
        fieldNames.add("bowel");
        fieldNames.add("bladder");
        fieldNames.add("findings");
        fieldNames.add("placenta_notes");
        fieldNames.add("remarks");
        fieldNames.add("completed");
        return fieldNames;
    }
}
