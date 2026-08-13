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

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.labkey.cageui.model.ConditionCode;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.Optional;

public class HousingForm
{
    private String id;
    @JsonProperty("taskid")
    private String taskId;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date date;
    @JsonProperty("enddate")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private Date endDate;
    private Integer qcState;
    private String room;
    @JsonProperty("cagenew")
    private String cageNew;
    @JsonProperty("condnew")
    private String condNew;
    private String reason;
    private String remark;
    private Integer project;
    @JsonProperty("performedby")
    private String performedBy;
    @JsonProperty("ejacconfirmed")
    private Boolean ejacConfirmed;
    @JsonProperty("lsid")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String lsid;

    public String getId()
    {
        return this.id;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    public String getTaskId()
    {
        return this.taskId;
    }

    public void setTaskId(String taskId)
    {
        this.taskId = taskId;
    }

    public Date getDate()
    {
        return this.date;
    }

    public void setDate(Date date)
    {
        this.date = date;
    }

    public Date getEndDate()
    {
        return this.endDate;
    }

    public void setEndDate(Date endDate)
    {
        this.endDate = endDate;
    }

    public Integer getQcState()
    {
        return this.qcState;
    }

    public void setQcState(Integer qcState)
    {
        this.qcState = qcState;
    }

    public String getRoom()
    {
        return this.room;
    }

    public void setRoom(String room)
    {
        this.room = room;
    }

    public String getReason()
    {
        return this.reason;
    }

    public void setReason(String reason)
    {
        this.reason = reason;
    }

    public String getRemark()
    {
        return this.remark;
    }

    public void setRemark(String remark)
    {
        this.remark = remark;
    }

    public Integer getProject()
    {
        return this.project;
    }

    public void setProject(Integer project)
    {
        this.project = project;
    }

    public String getPerformedBy()
    {
        return this.performedBy;
    }

    public void setPerformedBy(String performedBy)
    {
        this.performedBy = performedBy;
    }

    public Boolean getEjacConfirmed()
    {
        return this.ejacConfirmed;
    }

    public void setEjacConfirmed(Boolean ejacConfirmed)
    {
        this.ejacConfirmed = ejacConfirmed;
    }

    public String getCageNew()
    {
        return this.cageNew;
    }

    public void setCageNew(String cageNew)
    {
        this.cageNew = cageNew;
    }

    public String getCondNew()
    {
        return condNew;
    }

    public void setCondNew(String condNew)
    {
        this.condNew = condNew;
    }

    public String getLsid()
    {
        return lsid;
    }

    public void setLsid(String lsid)
    {
        this.lsid = lsid;
    }
}
