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

package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.json.JSONObject;

public class RacksForm
{
    private int _rowid;
    @JsonProperty("objectid")
    private String _objectId;
    @JsonProperty("rackid")
    private int _rackId;
    private String _room;
    @JsonProperty("rack_type")
    private int _rackType; // rowid of racktype
    private int _condition;

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public String getObjectId()
    {
        return _objectId;
    }

    public void setObjectId(String objectId)
    {
        _objectId = objectId;
    }

    public int getRackId()
    {
        return _rackId;
    }

    public void setRackId(int rackId)
    {
        _rackId = rackId;
    }

    public String getRoom()
    {
        return _room;
    }

    public void setRoom(String room)
    {
        _room = room;
    }

    public int getRackType()
    {
        return _rackType;
    }

    public void setRackType(int rackType)
    {
        _rackType = rackType;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("rowid", getRowid());
        json.put("objectid", getObjectId());
        json.put("rackid", getRackId());
        json.put("room", getRoom());
        json.put("rack_type", getRackType());

        return json;
    }

    public int getCondition()
    {
        return _condition;
    }

    public void setCondition(int condition)
    {
        _condition = condition;
    }
}
