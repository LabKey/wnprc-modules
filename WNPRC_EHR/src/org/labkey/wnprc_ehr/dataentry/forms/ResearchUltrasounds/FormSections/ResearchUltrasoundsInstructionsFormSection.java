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

import org.labkey.wnprc_ehr.dataentry.generics.sections.HTMLSection;

public class ResearchUltrasoundsInstructionsFormSection extends HTMLSection {
    public ResearchUltrasoundsInstructionsFormSection() {
        super("ResearchUltrasoundsInstructions", "Instructions for Form");
    }

    @Override
    public String getHTML() {
        return "<p style=\"padding: 10px\">\n" +
                "In the form below you can enter multiple comma separated values for all measurement fields (all fields from BPM to Nuchal Fold).<br><br>" +
                "For example, if you took 3 crown rump measurements of 28.33mm, 29.12mm, and 28.75mm, you would enter them into the 'Crown Rump (mm)' field as:<br>" +
                "<strong>28.33,29.12,28.75</strong>" +
                "</p>";
    }
}