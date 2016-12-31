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
package org.labkey.ehr.demographics;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.Container;
import org.labkey.api.ehr.demographics.AnimalRecord;
import org.labkey.api.ehr.demographics.DemographicsProvider;
import org.labkey.api.query.FieldKey;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 7/14/13
 * Time: 11:46 AM
 */
public class AnimalRecordImpl implements AnimalRecord
{
    private Map<String, Object> _props = Collections.unmodifiableMap(new CaseInsensitiveHashMap<>());
    private final Container _container;
    private final String _id;
    private final Date _created;

    private AnimalRecordImpl(Container c, String id)
    {
        _container = c;
        _id = id;
        _created = new Date();
    }

    private AnimalRecordImpl(Container c, String id, Map<String, Object> props)
    {
        this(c, id);
        if (props != null)
        {
            _props = Collections.unmodifiableMap(new CaseInsensitiveHashMap<>(props));
        }
    }

    public static AnimalRecordImpl create(Container c, String id, Map<String, Object> props)
    {
        return new AnimalRecordImpl(c, id, props);
    }

    public AnimalRecord createCopy()
    {
        return new AnimalRecordImpl(getContainer(), getId(), _props);
    }

    public synchronized void update(DemographicsProvider p, Map<String, Object> props)
    {
        Map<String, Object> mergedProps = new CaseInsensitiveHashMap<>(_props);
        for (String key : p.getKeys())
        {
            mergedProps.remove(key);
        }

        if (props != null)
            mergedProps.putAll(props);

        _props = Collections.unmodifiableMap(mergedProps);
    }

    public String getId()
    {
        return _id;
    }

    public Container getContainer()
    {
        return _container;
    }

    public Date getCreated()
    {
        return _created;
    }

    @NotNull
    public Map<String, Object> getProps()
    {
        return _props;
    }

    public String getGender()
    {
        return (String)_props.get("gender");
    }

    public String getGenderMeaning()
    {
        return (String)_props.get(FieldKey.fromString("gender/meaning").toString());
    }

    public String getOrigGender()
    {
        return (String)_props.get(FieldKey.fromString("gender/origGender").toString());
    }

    public String getAgeInYearsAndDays()
    {
        return (String)_props.get(FieldKey.fromString("Id/age/yearAndDays").toString());
    }

    public String getSpecies()
    {
        return (String)_props.get("species");
    }

    public String getCalculatedStatus()
    {
        return (String)_props.get("calculated_status");
    }

    public Date getBirth()
    {
        return (Date)_props.get("birth");
    }

    public boolean hasBirthRecord()
    {
        return _props.containsKey("birthInfo") && !getListProperty("birthInfo").isEmpty();
    }

    public boolean hasArrivalRecord()
    {
        return _props.containsKey("arrivalInfo") && !getListProperty("arrivalInfo").isEmpty();
    }

    public Date getDeath()
    {
        return (Date)_props.get("death");
    }

    public String getGeographicOrigin()
    {
        return (String)_props.get("geographic_origin");
    }

    //used to determine whether this row exists in the demographics table
    public String getDemographicsObjectId()
    {
        return (String)_props.get("demographicsObjectId");
    }

    public List<Map<String, Object>> getActiveAssignments()
    {
        return getListProperty("activeAssignments");
    }

    public List<Map<String, Object>> getActiveTreatments()
    {
        return getListProperty("activeTreatments");
    }

    public List<Map<String, Object>> getActiveHousing()
    {
        return getListProperty("activeHousing");
    }

    private List<Map<String, Object>> getListProperty(String prop)
    {
        if (_props.containsKey(prop) && _props.get(prop) instanceof List)
            return Collections.unmodifiableList((List)_props.get(prop));

        return null;
    }

    public String getCurrentRoom()
    {
        List<Map<String, Object>> housing = getActiveHousing();
        if (housing != null && housing.size() > 0)
            return (String)housing.get(0).get("room");

        return null;
    }

    public String getCurrentCage()
    {
        List<Map<String, Object>> housing = getActiveHousing();
        if (housing != null && housing.size() > 0)
            return (String)housing.get(0).get("cage");

        return null;
    }

    public List<Map<String, Object>> getActiveFlags()
    {
        return getListProperty("activeFlags");
    }

    public List<Map<String, Object>> getActiveProblem()
    {
        return getListProperty("activeProblems");
    }

    public List<Map<String, Object>> getActiveCases()
    {
        return getListProperty("activeCases");
    }

    public List<Map<String, Object>> getParents()
    {
        return getListProperty("parents");
    }

    public List<Map<String, Object>> getWeights()
    {
        return getListProperty("weights");
    }

    public Double getMostRecentWeight()
    {
        return (Double)_props.get(FieldKey.fromString("mostRecentWeight").toString());
    }

    public Date getMostRecentWeightDate()
    {
        return (Date)_props.get(FieldKey.fromString("mostRecentWeightDate").toString());
    }

    public Date getMostRecentDeparture()
    {
        return (Date)_props.get(FieldKey.fromString("mostRecentDeparture").toString());
    }

    public Date getMostRecentArrival()
    {
        if (_props.containsKey("source"))
        {
            List<Map<String, Object>> rows = (List)_props.get("source");
            if (rows.size() > 0)
                return (Date)rows.get(0).get("date");
        }

        return null;
    }

    public Integer getDaysSinceWeight()
    {
        return (Integer)_props.get(FieldKey.fromString("daysSinceWeight").toString());
    }
}