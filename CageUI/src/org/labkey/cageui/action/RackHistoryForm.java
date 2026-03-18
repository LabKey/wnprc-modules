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

public class RackHistoryForm
{
    private int _rowid;
    @JsonProperty("objectid")
    private String _objectId;
    @JsonProperty("historyid")
    private String _historyId;
    private String _room;
    private int _condition;
    private String _notes;

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

    public String getHistoryId()
    {
        return _historyId;
    }

    public void setHistoryId(String historyId)
    {
        _historyId = historyId;
    }

    public String getRoom()
    {
        return _room;
    }

    public void setRoom(String room)
    {
        _room = room;
    }

    public int getCondition()
    {
        return _condition;
    }

    public void setCondition(int condition)
    {
        _condition = condition;
    }

    public String getNotes()
    {
        return _notes;
    }

    public void setNotes(String notes)
    {
        _notes = notes;
    }
}
