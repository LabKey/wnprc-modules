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

public class LayoutHistoryForm
{
    private int _rowid;
    @JsonProperty("historyid")
    private String _historyId;
    private String _cage;
    @JsonProperty("object_type")
    private int _objectType;
    @JsonProperty("extra_context")
    private String _extraContext;
    @JsonProperty("x_coord")
    private int _xCoord;
    @JsonProperty("y_coord")
    private int _yCoord;


    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public int getObjectType()
    {
        return _objectType;
    }

    public void setObjectType(int objectType)
    {
        _objectType = objectType;
    }

    public String getExtraContext()
    {
        return _extraContext;
    }

    public void setExtraContext(String extraContext)
    {
        _extraContext = extraContext;
    }

    public int getxCoord()
    {
        return _xCoord;
    }

    public void setxCoord(int xCoord)
    {
        _xCoord = xCoord;
    }

    public int getyCoord()
    {
        return _yCoord;
    }

    public void setyCoord(int yCoord)
    {
        _yCoord = yCoord;
    }

    public String getHistoryId()
    {
        return _historyId;
    }

    public void setHistoryId(String historyId)
    {
        _historyId = historyId;
    }

    public String getCage()
    {
        return _cage;
    }

    public void setCage(String cage)
    {
        _cage = cage;
    }
}
