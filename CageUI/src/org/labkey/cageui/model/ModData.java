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

import org.json.JSONObject;

public class ModData
{
    private String _modId;
    private String _parentModId;
    private String _rack;
    private String _cage;
    private ModTypes _modification;
    private ModLocations _location;
    private int _subId;

    public String getModId()
    {
        return _modId;
    }

    public void setModId(String modId)
    {
        _modId = modId;
    }

    public String getParentModId()
    {
        return _parentModId;
    }

    public void setParentModId(String parentModId)
    {
        _parentModId = parentModId;
    }

    public String getRack()
    {
        return _rack;
    }

    public void setRack(String rack)
    {
        _rack = rack;
    }

    public String getCage()
    {
        return _cage;
    }

    public void setCage(String cage)
    {
        _cage = cage;
    }

    public ModTypes getModification()
    {
        return _modification;
    }

    public void setModification(ModTypes modification)
    {
        _modification = modification;
    }

    public ModLocations getLocation()
    {
        return _location;
    }

    public void setLocation(ModLocations location)
    {
        _location = location;
    }

    public int getSubId()
    {
        return _subId;
    }

    public void setSubId(int subId)
    {
        _subId = subId;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("modId", getModId());
        json.put("parentModId", getParentModId());
        json.put("rack", getRack());
        json.put("cage", getCage());
        json.put("modification", getModification().toString());
        json.put("location", getLocation().toString());
        json.put("subId", getSubId());

        return json;
    }
}
