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
package org.labkey.wnprc_ehr.dataentry.generics.sections;

import org.json.JSONObject;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.NonStoreFormSection;

/**
 * Created by jon on 3/4/16.
 */
public abstract class HTMLSection extends NonStoreFormSection
{
    private static final String XTYPE = "panel";

    public HTMLSection(String name, String label) {
        super(name, label, XTYPE);
    }

    public abstract String getHTML();

    @Override
    public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements)
    {
        JSONObject json = super.toJSON(ctx, includeFormElements);

        // formConfig gets copied onto the section Ext4 config.
        JSONObject formConfig;
        if (json.has("formConfig"))
        {
            formConfig = json.getJSONObject("formConfig");
        }
        else
        {
            formConfig = new JSONObject();
        }
        formConfig.put("html", getHTML());
        json.put("formConfig", formConfig);

        return json;
    }
}
