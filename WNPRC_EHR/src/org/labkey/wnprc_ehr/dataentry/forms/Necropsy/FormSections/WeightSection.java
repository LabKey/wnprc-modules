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

import java.util.Arrays;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SlaveFormSection;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class WeightSection extends SlaveFormSection {
    public WeightSection() {
        super("study", "Weight", "Weight");

        maxItemsPerColumn = 1;
    }

    @Override
    public Set<String> getSlaveFields() {
        Set<String> fields = new HashSet<>();

        fields.add("Id");
        fields.add("project");

        return fields;
    }

    @Override
    protected List<String> getFieldNames() {
        return Arrays.asList("Id", "project", "date", "weight", "remark");
    }
}