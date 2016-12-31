/*
 * Copyright (c) 2013-2016 LabKey Corporation
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
package org.labkey.api.ehr.dataentry;

import org.json.JSONObject;
import org.labkey.api.view.template.ClientDependency;

import java.util.HashMap;
import java.util.Map;

/**
 * User: bimber
 * Date: 6/9/13
 * Time: 4:15 PM
 */
public class SingleQueryFormSection extends SimpleFormSection
{
    public SingleQueryFormSection(String schema, String query, String label)
    {
        super(schema, query, label, "ehr-simpledataentryformpanel");
        addClientDependency(ClientDependency.fromPath("ehr/form/SimpleDataEntryFormPanel.js"));
    }

    @Override
    public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements)
    {
        JSONObject ret = super.toJSON(ctx, includeFormElements);

        Map<String, Object> formConfig = new HashMap<>();
        Map<String, Object> bindConfig = new HashMap<>();
        bindConfig.put("createRecordOnLoad", true);
        formConfig.put("bindConfig", bindConfig);
        formConfig.put("title", null);
        formConfig.put("label", null);
        formConfig.put("maxItemsPerCol", 8);
        ret.put("formConfig", formConfig);

        return ret;
    }
}
