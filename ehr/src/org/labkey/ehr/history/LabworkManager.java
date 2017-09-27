/*
 * Copyright (c) 2013-2015 LabKey Corporation
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
package org.labkey.ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.ehr.history.LabworkType;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 3/6/13
 * Time: 9:44 AM
 */
public class LabworkManager
{
    private static final LabworkManager _instance = new LabworkManager();
    private List<LabworkType> _types = new ArrayList<>();

    private LabworkManager()
    {
    }

    public static LabworkManager get()
    {
        return _instance;
    }

    public void registerType(LabworkType type)
    {
        _types.add(type);
    }

    public Collection<LabworkType> getTypes(Container c)
    {
        List<LabworkType> result = new ArrayList<>(_types.size());
        for (LabworkType type : _types)
        {
            if (type.isEnabled(c))
            {
                result.add(type);
            }
        }
        return Collections.unmodifiableCollection(result);
    }

    public List<String> getResults(Container c, User u, String runId, boolean redacted)
    {
        List<String> list = new ArrayList<>();
        for (LabworkType type : getTypes(c))
        {
            list.addAll(type.getResults(c, u, runId, redacted));
        }

        return list;
    }

    public Map<String, List<String>> getResults(Container c, User u, List<String> runIds, boolean redacted)
    {
        Map<String, List<String>> map = new HashMap<>();
        for (LabworkType type : getTypes(c))
        {
            merge(map, type.getResults(c, u, runIds, redacted));
        }

        return map;
    }

    public Map<String, List<String>> getResults(Container c, User u, String id, Date minDate, Date maxDate, boolean redacted)
    {
        Map<String, List<String>> map = new HashMap<>();
        for (LabworkType type : getTypes(c))
        {
            merge(map, type.getResults(c, u, id, minDate, maxDate, redacted));
        }

        return map;
    }

    private void merge(Map<String, List<String>> map, Map<String, List<String>> newMap)
    {
        for (String runId : newMap.keySet())
        {
            List<String> existing = map.get(runId);
            if (existing == null)
                existing = new ArrayList<>();

            existing.addAll(newMap.get(runId));

            map.put(runId, existing);
        }
    }
}
