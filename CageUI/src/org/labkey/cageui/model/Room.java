/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.labkey.cageui.action.RoomHistoryForm;

import java.util.List;
import java.util.Map;

public class Room
{
    private String _name;
    private String _species;
    private List<RackGroup> _rackGroups;
    private List<RoomObject> _objects;
    private LayoutData _layoutData;
    private Map<String, ModEntry> _mods;

    public String getName()
    {
        return _name;
    }

    public void setName(String name)
    {
        _name = name;
    }

    public List<RackGroup> getRackGroups()
    {
        return _rackGroups;
    }

    public void setRackGroups(List<RackGroup> rackGroups)
    {
        _rackGroups = rackGroups;
    }

    public List<RoomObject> getObjects()
    {
        return _objects;
    }

    public void setObjects(List<RoomObject> objects)
    {
        _objects = objects;
    }

    public LayoutData getLayoutData()
    {
        return _layoutData;
    }

    public void setLayoutData(LayoutData layoutData)
    {
        _layoutData = layoutData;
    }

    public Map<String, ModEntry> getMods()
    {
        return _mods;
    }

    public void setMods(Map<String, ModEntry> mods)
    {
        _mods = mods;
    }

    public String getSpecies()
    {
        return _species;
    }

    public void setSpecies(String species)
    {
        _species = species;
    }
}
