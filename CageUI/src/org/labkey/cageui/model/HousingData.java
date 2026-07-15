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

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public class HousingData
{
    private String _id;
    private String _objectId;
    private String _taskId;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date _date;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date _endDate;
    private Integer _qcState;
    private String _room;
    private String _cage;
    private String _reason;
    private String _remark;
    private Integer _project;
    private String _performedBy;
    private Boolean _ejacConfirmed;

    public String getId()
    {
        return _id;
    }

    public void setId(String id)
    {
        _id = id;
    }

    public String getObjectId()
    {
        return _objectId;
    }

    public void setObjectId(String objectId)
    {
        _objectId = objectId;
    }

    public String getTaskId()
    {
        return _taskId;
    }

    public void setTaskId(String taskId)
    {
        _taskId = taskId;
    }

    public Date getDate()
    {
        return _date;
    }

    public void setDate(Date date)
    {
        _date = date;
    }

    public Date getEndDate()
    {
        return _endDate;
    }

    public void setEndDate(Date endDate)
    {
        _endDate = endDate;
    }

    public Integer getQcState()
    {
        return _qcState;
    }

    public void setQcState(Integer qcState)
    {
        _qcState = qcState;
    }

    public String getRoom()
    {
        return _room;
    }

    public void setRoom(String room)
    {
        _room = room;
    }

    public String getCage()
    {
        return _cage;
    }

    public void setCage(String cage)
    {
        _cage = cage;
    }

    public String getReason()
    {
        return _reason;
    }

    public void setReason(String reason)
    {
        _reason = reason;
    }

    public String getRemark()
    {
        return _remark;
    }

    public void setRemark(String remark)
    {
        _remark = remark;
    }

    public Integer getProject()
    {
        return _project;
    }

    public void setProject(Integer project)
    {
        _project = project;
    }

    public String getPerformedBy()
    {
        return _performedBy;
    }

    public void setPerformedBy(String performedBy)
    {
        _performedBy = performedBy;
    }

    public Boolean getEjacConfirmed()
    {
        return _ejacConfirmed;
    }

    public void setEjacConfirmed(Boolean ejacConfirmed)
    {
        _ejacConfirmed = ejacConfirmed;
    }
}
