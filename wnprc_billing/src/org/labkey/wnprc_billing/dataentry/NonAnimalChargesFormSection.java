/*
 * Copyright (c) 2019-2026 LabKey Corporation
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
package org.labkey.wnprc_billing.dataentry;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collections;
import java.util.List;

/**
 * Class to administer Ext4JS component/panel for ehr_billing.miscCharges data entry for charges without animal id and project
 */
public class NonAnimalChargesFormSection extends SimpleFormSection {

    public NonAnimalChargesFormSection()
    {
        this(EHRService.FORM_SECTION_LOCATION.Body);
    }

    public NonAnimalChargesFormSection(EHRService.FORM_SECTION_LOCATION location)
    {
        super("ehr_billing", "miscCharges", "Misc. Charges", "ehr-gridpanel", location);
        _allowRowEditing = false;

        addClientDependency(ClientDependency.supplierFromPath("wnprc_billing/model/sources/NonAnimalCharges.js"));

        setConfigSources(Collections.singletonList("Task"));
    }

    @Override
    public List<String> getTbarButtons()
    {
        List<String> defaultButtons = super.getTbarButtons();

        // Remove the default buttons that don't make sense for charges Without animal ids
        defaultButtons.remove("ADDANIMALS");
        defaultButtons.remove("COPYFROMSECTION");
        defaultButtons.remove("TEMPLATE");

        return defaultButtons;
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultMoreActionButtons = super.getTbarMoreActionButtons();
        defaultMoreActionButtons.remove("GUESSPROJECT");
        defaultMoreActionButtons.remove("COPY_IDS");
        return defaultMoreActionButtons;
    }
}
