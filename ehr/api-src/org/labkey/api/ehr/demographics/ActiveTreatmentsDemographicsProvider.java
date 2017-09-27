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
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * User: bimber
 * Date: 7/14/13
 * Time: 10:29 AM
 */
public class ActiveTreatmentsDemographicsProvider extends AbstractListDemographicsProvider
{
    public ActiveTreatmentsDemographicsProvider(Module owner)
    {
        super(owner, "study", "Treatment Orders", "activeTreatments");
        _supportsQCState = false;
    }

    protected Set<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();
        keys.add(FieldKey.fromString("lsid"));
        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("code"));
        keys.add(FieldKey.fromString("code/meaning"));
        keys.add(FieldKey.fromString("date"));
        keys.add(FieldKey.fromString("enddate"));
        keys.add(FieldKey.fromString("performedby"));
        keys.add(FieldKey.fromString("route"));

        keys.add(FieldKey.fromString("dosage"));
        keys.add(FieldKey.fromString("dosage_units"));
        keys.add(FieldKey.fromString("amount"));
        keys.add(FieldKey.fromString("amount_units"));
        keys.add(FieldKey.fromString("concentration"));
        keys.add(FieldKey.fromString("concentration_units"));
        keys.add(FieldKey.fromString("volume"));
        keys.add(FieldKey.fromString("vol_units"));
        keys.add(FieldKey.fromString("amountAndVolume"));

        keys.add(FieldKey.fromString("remark"));
        keys.add(FieldKey.fromString("frequency"));
        keys.add(FieldKey.fromString("frequency/meaning"));

        keys.add(FieldKey.fromString("amountWithUnits"));
        keys.add(FieldKey.fromString("category"));

        return keys;
    }

    @Override
    public Collection<String> getKeysToTest()
    {
        //for now, simply skip the whole provider.  because different records can be active from day to day, this makes validation tricky
        Set<String> keys = new HashSet<>(super.getKeysToTest());
        keys.remove(_propName);

        return keys;
    }

    @Override
    protected SimpleFilter getFilter(Collection<String> ids)
    {
        SimpleFilter filter = super.getFilter(ids);
        filter.addCondition(FieldKey.fromString("enddateTimeCoalesced"), new Date(), CompareType.GTE);

        return filter;
    }
}
