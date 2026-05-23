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
package org.labkey.wnprc_ehr.dataentry.forms.ProcedureRequest;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.ProcedureRequest.FormSections.BloodDrawsSection;
import org.labkey.wnprc_ehr.dataentry.forms.ProcedureRequest.FormSections.ProceduresRequestedSection;

import java.util.Arrays;

public class ProcedureRequestForm extends TaskForm {
    public static final String NAME = "Procedure Request";

    public ProcedureRequestForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.REQUESTS, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new ProceduresRequestedSection(),
                new BloodDrawsSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Request");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/Request.js"));
    }
}
