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
package org.labkey.wnprc_ehr.dataentry.forms.FoodDeprivesRequest.FormSections;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
//import org.labkey.wnprc_ehr.dataentry.SimpleFormSection;

import java.util.List;

/**
 * Created by fdnicolalde on 3/9/16.
 */
public class FoodDeprivesRequestFormSections extends SimpleFormSection
{
    public FoodDeprivesRequestFormSections()
    {
        super ("study", "foodDeprives", "Food Deprives", "ehr-gridpanel");
        this.addConfigSource("WNPRC_Request");
        this.addConfigSource("Husbandry");
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = super.getTbarMoreActionButtons();
        defaultButtons.add("REPEAT_SELECTED");

        return defaultButtons;
    }

}
