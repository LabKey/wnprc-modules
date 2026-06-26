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

public class GhostCagesForm
{
    private int _rowid;
    @JsonProperty("cage_objectid")
    private String _cageObjectId;
    @JsonProperty("positionid")
    private int _positionId;
    @JsonProperty("rack_group")
    private int _rackGroup;
    @JsonProperty("rack_objectid")
    private String _rackObjectId;
    @JsonProperty("group_rotation")
    private int _groupRotation;
    private int _cage;

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public String getCageObjectId()
    {
        return _cageObjectId;
    }

    public void setCageObjectId(String cageObjectId)
    {
        _cageObjectId = cageObjectId;
    }

    public int getPositionId()
    {
        return _positionId;
    }

    public void setPositionId(int positionId)
    {
        _positionId = positionId;
    }

    public int getRackGroup()
    {
        return _rackGroup;
    }

    public void setRackGroup(int rackGroup)
    {
        _rackGroup = rackGroup;
    }

    public String getRackObjectId()
    {
        return _rackObjectId;
    }

    public void setRackObjectId(String rackObjectId)
    {
        _rackObjectId = rackObjectId;
    }

    public int getGroupRotation()
    {
        return _groupRotation;
    }

    public void setGroupRotation(int groupRotation)
    {
        _groupRotation = groupRotation;
    }

    public int getCage()
    {
        return _cage;
    }

    public void setCage(int cage)
    {
        _cage = cage;
    }
}
