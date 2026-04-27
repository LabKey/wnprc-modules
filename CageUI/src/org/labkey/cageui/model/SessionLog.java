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
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

public class SessionLog
{
    @JsonProperty("start_time")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    private Date _startTime;
    @JsonProperty("end_time")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    private Date _endTime;
    @JsonProperty("user_agent")
    private String _userAgent;
    @JsonProperty("schema_name")
    private String _schemaName;
    @JsonProperty("query_name")
    private String _queryName;
    @JsonProperty("task_id")
    private String _taskId;
    @JsonProperty("number_of_records")
    private Integer _numberOfRecords;
    @JsonProperty("errors_occurred")
    private Boolean _errorsOccurred;


    public Date getStartTime()
    {
        return _startTime;
    }

    public void setStartTime(Date startTime)
    {
        _startTime = startTime;
    }

    public Date getEndTime()
    {
        return _endTime;
    }

    public void setEndTime(Date endTime)
    {
        _endTime = endTime;
    }

    public String getUserAgent()
    {
        return _userAgent;
    }

    public void setUserAgent(String userAgent)
    {
        _userAgent = userAgent;
    }

    public String getSchemaName()
    {
        return _schemaName;
    }

    public void setSchemaName(String schemaName)
    {
        _schemaName = schemaName;
    }

    public String getQueryName()
    {
        return _queryName;
    }

    public void setQueryName(String queryName)
    {
        _queryName = queryName;
    }

    public String getTaskId()
    {
        return _taskId;
    }

    public void setTaskId(String taskId)
    {
        _taskId = taskId;
    }

    public Integer getNumberOfRecords()
    {
        return _numberOfRecords;
    }

    public void setNumberOfRecords(Integer numberOfRecords)
    {
        _numberOfRecords = numberOfRecords;
    }

    public Boolean isErrorsOccurred()
    {
        return _errorsOccurred;
    }

    public void setErrorsOccurred(Boolean errorsOccurred)
    {
        _errorsOccurred = errorsOccurred;
    }
}
