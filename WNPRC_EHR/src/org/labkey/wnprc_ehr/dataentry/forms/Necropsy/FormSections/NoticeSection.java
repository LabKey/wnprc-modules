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
 * Created by jon on 3/4/16.
 */
public class NoticeSection extends HTMLSection {
    public NoticeSection() {
        super("Notice", "Notice");
    }

    @Override
    public String getHTML() {
        String pathToJsp = "/org/labkey/wnprc_ehr/dataentry/forms/Necropsy/FormSections/RequestNotice.jsp";

        WNPRC_EHREmail<NullModel> email = new WNPRC_EHREmail(pathToJsp);

        String text;
        try {
            text = email.renderEmail(new NullModel(), false);
        }
        catch (Exception e) {
            text = "An error occurred";
        }
        return text;
    }

    public static class NullModel {}
}
