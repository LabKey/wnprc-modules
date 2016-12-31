/*
 * Copyright (c) 2013-2014 LabKey Corporation
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
package org.labkey.ehr.dataentry;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 11:03 AM
 */
public class SimpleGridpanelForm extends AbstractDataEntryForm
{
    private SimpleGridpanelForm(DataEntryFormContext ctx, Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(ctx, owner, name, label, category, sections);
    }

    public static SimpleGridpanelForm create(DataEntryFormContext ctx, Module owner, String schemaName, String queryName, String category)
    {
        List<FormSection> sections = new ArrayList<>();
        String label = StringUtils.capitalize(queryName);
        sections.add(new SimpleGridPanel(schemaName, queryName, label));

        return new SimpleGridpanelForm(ctx, owner, queryName, label, category, sections);
    }

    public JSONObject toJSON()
    {
        JSONObject json = super.toJSON();

//        Set<TableInfo> tables = getFormSections().get(0).getTables(c, u);
//        for (TableInfo ti : tables)
//        {
//            ti.getPkColumnNames();
//        }

        return json;
    }
}
