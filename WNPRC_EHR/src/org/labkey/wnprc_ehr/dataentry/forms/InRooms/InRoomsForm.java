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
package org.labkey.wnprc_ehr.dataentry.forms.InRooms;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.WNPRCConstants;
import org.labkey.wnprc_ehr.dataentry.forms.InRooms.FormSections.InRoomPerAnimalSection;

import java.util.Arrays;

public class InRoomsForm extends TaskForm {
    public static final String NAME = "In Rooms";

    public InRoomsForm(DataEntryFormContext ctx, Module owner) {
        super(ctx, owner, NAME, "Enter In Rooms", WNPRCConstants.DataEntrySections.CLINICAL_SPI, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new InRoomPerAnimalSection()
        ));

        for(FormSection section: this.getFormSections()) {
            section.addConfigSource("Task");
            section.addConfigSource("InRooms");
        }

        this.addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/model/sources/InRooms.js"));
    }
}
