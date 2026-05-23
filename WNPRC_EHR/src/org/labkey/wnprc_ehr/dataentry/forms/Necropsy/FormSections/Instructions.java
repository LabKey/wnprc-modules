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

import org.labkey.wnprc_ehr.WNPRC_EHREmail;
import org.labkey.wnprc_ehr.dataentry.generics.sections.HTMLSection;

/**
 * Created by jon on 5/3/16.
 */
public class Instructions extends HTMLSection {
    public Instructions() {
        super("NecropsyRequestInstructions", "Instructions for Form");
    }

    @Override
    public String getHTML() {


        String pathToJsp = "/org/labkey/wnprc_ehr/dataentry/forms/Necropsy/FormSections/Instructions.jsp";

        WNPRC_EHREmail<NoticeSection.NullModel> email = new WNPRC_EHREmail(pathToJsp);

        String text;
        try {
            text = email.renderEmail(new NoticeSection.NullModel());
        }
        catch (Exception e) {
            text = "An error occurred";
        }
        return "<p style=\"padding: 10px\">\n" +
                "    In the form below, select a preferred time for the necropsy.  If you have any other preferences regarding the\n" +
                "    scheduling of the necropsy, such as a date range, AM vs PM, etc., please put these in the comments section.\n" +
                "</p>";
    }
}
