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

public class CageModificationHistoryForm
{
    private Integer _rowid;
    @JsonProperty("historyid")
    private String _historyId;
    private String _cage;
    @JsonProperty("modid")
    private String _modId;
    @JsonProperty("parent_modid")
    private String _parentModId;
    private String _modification;
    @JsonProperty("subid")
    private int _subId;
    private int _location;

    public int getSubId()
    {
        return _subId;
    }

    public void setSubId(int subId)
    {
        _subId = subId;
    }

    public int getLocation()
    {
        return _location;
    }

    public void setLocation(int location)
    {
        _location = location;
    }

    public String getModification()
    {
        return _modification;
    }

    public void setModification(String modification)
    {
        _modification = modification;
    }

    public String getModId()
    {
        return _modId;
    }

    public void setModId(String modId)
    {
        _modId = modId;
    }

    public Integer getRowid()
    {
        return _rowid;
    }

    public void setRowid(Integer rowid)
    {
        _rowid = rowid;
    }

    public String getParentModId()
    {
        return _parentModId;
    }

    public void setParentModId(String parentModId)
    {
        _parentModId = parentModId;
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
