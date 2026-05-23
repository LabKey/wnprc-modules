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

import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;

import java.util.Set;

/**
 * Created by jon on 4/13/16.
 */
abstract public class SlaveFormSection extends SimpleFormSection
{
    public SlaveFormSection(String schemaName, String queryName, String label)
    {
        super(schemaName, queryName, label);

        setClientStoreClass("WNPRC.ext.data.SingleAnimal.SlaveSectionClientStore");
    }

    @Override
    public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements)
    {
        JSONObject json = super.toJSON(ctx, includeFormElements);

        JSONArray slaveFields = new JSONArray();
        for (String field : getSlaveFields())
        {
            slaveFields.put(field);
        }
        json.put("slaveFieldsToInclude", slaveFields);

        return json;
    }

    abstract public Set<String> getSlaveFields();
}
