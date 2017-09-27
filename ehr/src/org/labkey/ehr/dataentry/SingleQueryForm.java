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

import org.json.JSONObject;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.SingleQueryFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 12:45 PM
 */
public class SingleQueryForm extends AbstractDataEntryForm
{
    private TableInfo _table;

    private SingleQueryForm(DataEntryFormContext ctx, Module owner, String name, String label, String category, TableInfo ti, List<FormSection> sections)
    {
        super(ctx, owner, name, label, category, sections);
        setJavascriptClass("EHR.panel.SimpleDataEntryPanel");

        _table = ti;

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("SingleQuery");
        }

        addClientDependency(ClientDependency.fromPath("ehr/model/sources/SingleQuery.js"));
    }

    public static SingleQueryForm create(DataEntryFormContext ctx, Module owner, TableInfo ti)
    {
        return create(ctx, owner, ti, new SingleQueryFormSection(ti.getPublicSchemaName(), ti.getPublicName(), ti.getTitle()));
    }

    public static SingleQueryForm create(DataEntryFormContext ctx, Module owner, TableInfo ti, FormSection section)
    {
        return new SingleQueryForm(ctx, owner, ti.getPublicName(), ti.getTitle(), "Custom", ti, Arrays.asList(section));
    }

    public JSONObject toJSON()
    {
        JSONObject json = super.toJSON();
        json.put("pkCols", _table.getPkColumnNames());

        return json;
    }


    @Override
    protected List<String> getButtonConfigs()
    {
        return Collections.singletonList("BASICSUBMIT");
    }

    @Override
    protected List<String> getMoreActionButtonConfigs()
    {
        return Collections.emptyList();
    }
}
