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
package org.labkey.api.ehr.demographics;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ehr.demographics.AbstractListDemographicsProvider;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * User: bimber
 * Date: 7/14/13
 * Time: 10:29 AM
 */
public class ActiveAssignmentsDemographicsProvider extends AbstractListDemographicsProvider
{
    public ActiveAssignmentsDemographicsProvider(Module owner)
    {
        super(owner, "study", "Assignment", "activeAssignments");
    }

    protected Set<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();
        keys.add(FieldKey.fromString("lsid"));
        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("date"));
        keys.add(FieldKey.fromString("enddate"));
        keys.add(FieldKey.fromString("projectedRelease"));
        keys.add(FieldKey.fromString("project"));
        keys.add(FieldKey.fromString("project/title"));
        keys.add(FieldKey.fromString("project/displayName"));
        keys.add(FieldKey.fromString("project/protocol"));
        keys.add(FieldKey.fromString("project/use_category"));
        keys.add(FieldKey.fromString("project/protocol/displayName"));
        keys.add(FieldKey.fromString("project/investigatorId"));
        keys.add(FieldKey.fromString("project/investigatorId/firstName"));
        keys.add(FieldKey.fromString("project/investigatorId/lastName"));
        keys.add(FieldKey.fromString("protocol/displayName"));
        keys.add(FieldKey.fromString("remark"));

        return keys;
    }

    @Override
    protected SimpleFilter getFilter(Collection<String> ids)
    {
        SimpleFilter filter = super.getFilter(ids);
        filter.addCondition(FieldKey.fromString("isActive"), true, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("qcstate/publicData"), true, CompareType.EQUAL);

        return filter;
    }

    @Override
    public boolean requiresRecalc(String schema, String query)
    {
        return ("study".equalsIgnoreCase(schema) && "Assignment".equalsIgnoreCase(query)) ||
               ("study".equalsIgnoreCase(schema) && "Animal Record Flags".equalsIgnoreCase(query)) ||
               ("study".equalsIgnoreCase(schema) && "flags".equalsIgnoreCase(query));
    }

    @Override
    public Collection<String> getKeysToTest()
    {
        //for now, simply skip the whole provider.  because different records can be active from day to day, this makes validation tricky
        Set<String> keys = new HashSet<>(super.getKeysToTest());
        keys.remove(_propName);

        return keys;
    }
}
