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

public class CagesForm
{
    private int _rowid;
    @JsonProperty("objectid")
    private String _objectId;
    @JsonProperty("positionid")
    private int _positionId;
    private String _rack;
    @JsonProperty("cage_number")
    private int _cageNumber;
    private Double _length;
    private Double _width;
    private Double _height;
    private Double _sqft;

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

    public String getRack()
    {
        return _rack;
    }

    public void setRack(String rack)
    {
        _rack = rack;
    }

    public int getCageNumber()
    {
        return _cageNumber;
    }

    public void setCageNumber(int cageNumber)
    {
        _cageNumber = cageNumber;
    }

    public Double getLength()
    {
        return _length;
    }

    public void setLength(Double length)
    {
        _length = length;
    }

    public Double getWidth()
    {
        return _width;
    }

    public void setWidth(Double width)
    {
        _width = width;
    }

    public Double getHeight()
    {
        return _height;
    }

    public void setHeight(Double height)
    {
        _height = height;
    }

    public int getPositionId()
    {
        return _positionId;
    }

    public void setPositionId(int positionId)
    {
        _positionId = positionId;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("rowid", getRowid());
        json.put("objectid", getObjectId());
        json.put("positionid", getPositionId());
        json.put("rack", getRack());
        json.put("cage_number", getCageNumber());
        json.put("length", getLength());
        json.put("width", getWidth());
        json.put("height", getHeight());

        return json;
    }

    public Double getSqft()
    {
        return _sqft;
    }

    public void setSqft(Double sqft)
    {
        _sqft = sqft;
    }
}

