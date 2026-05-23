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
package org.labkey.wnprc_ehr.dataentry.forms.TreatmentOrders.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

import java.util.List;

public class TreatmentOrdersSection extends SimpleFormSection {
    //boolean _isRequest = false;
    protected boolean _showAddTreatments = true;



    public TreatmentOrdersSection() {

        super("study", "Treatment Orders", "Treatments", "ehr-gridpanel");
        addClientDependency(ClientDependency.supplierFromPath("ehr/window/AddScheduledTreatmentWindow.js"));

    }
    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = super.getTbarMoreActionButtons();
        defaultButtons.add("REPEAT_SELECTED");

        if (_showAddTreatments)
            defaultButtons.add("ADDTREATMENTS");

        return defaultButtons;
    }
}
