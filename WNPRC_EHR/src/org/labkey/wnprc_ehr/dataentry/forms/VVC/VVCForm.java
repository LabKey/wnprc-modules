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
package org.labkey.wnprc_ehr.dataentry.forms.VVC;

import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.module.Module;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.VVC.FormSections.VVCInfoSection;
import org.labkey.wnprc_ehr.dataentry.generics.forms.SimpleTaskForm;
import org.labkey.wnprc_ehr.dataentry.generics.sections.TaskFormSection;

import java.util.Arrays;

public class VVCForm extends SimpleTaskForm{
    public static final String NAME ="VVC";

    public VVCForm(DataEntryFormContext ctx, Module owner){
        super(ctx, owner, NAME, NAME, WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new VVCInfoSection()
        ));

    }
}
