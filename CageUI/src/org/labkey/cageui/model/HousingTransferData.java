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

public class HousingTransferData
{
    private String id;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date inDate;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date outDate;
    private Option<Integer> destinationRoom;
    private Option<String> destinationCage;
    private Option<String>[] condition;
    private Option<String>[] reasonForMove;
    private String project;
    private String remarks;
    private String performedBy;
    private boolean alert;
    private boolean ejacConfirmed;
    private Option<Integer> currentRoom;
    private Option<String> currentCage;

    public String getId()
    {
        return id;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    public Date getInDate()
    {
        return inDate;
    }

    public void setInDate(Date inDate)
    {
        this.inDate = inDate;
    }

    public Date getOutDate()
    {
        return outDate;
    }

    public void setOutDate(Date outDate)
    {
        this.outDate = outDate;
    }

    public Option<Integer> getDestinationRoom()
    {
        return destinationRoom;
    }

    public void setDestinationRoom(Option<Integer> destinationRoom)
    {
        this.destinationRoom = destinationRoom;
    }

    public Option<String> getDestinationCage()
    {
        return destinationCage;
    }

    public void setDestinationCage(Option<String> destinationCage)
    {
        this.destinationCage = destinationCage;
    }

    public Option<String>[] getCondition()
    {
        return condition;
    }

    public void setCondition(Option<String>[] condition)
    {
        this.condition = condition;
    }

    public Option<String>[] getReasonForMove()
    {
        return reasonForMove;
    }

    public void setReasonForMove(Option<String>[] reasonForMove)
    {
        this.reasonForMove = reasonForMove;
    }

    public String getProject()
    {
        return project;
    }

    public void setProject(String project)
    {
        this.project = project;
    }

    public String getRemarks()
    {
        return remarks;
    }

    public void setRemarks(String remarks)
    {
        this.remarks = remarks;
    }

    public String getPerformedBy()
    {
        return performedBy;
    }

    public void setPerformedBy(String performedBy)
    {
        this.performedBy = performedBy;
    }

    public boolean isAlert()
    {
        return alert;
    }

    public void setAlert(boolean alert)
    {
        this.alert = alert;
    }

    public boolean isEjacConfirmed()
    {
        return ejacConfirmed;
    }

    public void setEjacConfirmed(boolean ejacConfirmed)
    {
        this.ejacConfirmed = ejacConfirmed;
    }

    public Option<Integer> getCurrentRoom()
    {
        return currentRoom;
    }

    public void setCurrentRoom(Option<Integer> currentRoom)
    {
        this.currentRoom = currentRoom;
    }

    public Option<String> getCurrentCage()
    {
        return currentCage;
    }

    public void setCurrentCage(Option<String> currentCage)
    {
        this.currentCage = currentCage;
    }
}
