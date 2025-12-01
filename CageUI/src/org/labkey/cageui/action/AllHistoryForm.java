package org.labkey.cageui.action;;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

public class AllHistoryForm
{
    private Integer _rowid;
    private String _room;
    private boolean _valid;
    @JsonProperty("history_type")
    private String _historyType;
    @JsonProperty("start_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date _startDate;
    @JsonProperty("end_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date _endDate;
    @JsonProperty("historyid")
    private String _historyId;

    public String getRoom()
    {
        return _room;
    }

    public void setRoom(String room)
    {
        _room = room;
    }

    public Integer getRowid()
    {
        return _rowid;
    }

    public void setRowid(Integer rowid)
    {
        _rowid = rowid;
    }

    public boolean isValid()
    {
        return _valid;
    }

    public void setValid(boolean valid)
    {
        _valid = valid;
    }

    public String getHistoryType()
    {
        return _historyType;
    }

    public void setHistoryType(String historyType)
    {
        _historyType = historyType;
    }

    public Date getStartDate()
    {
        return _startDate;
    }

    public void setStartDate(Date startDate)
    {
        _startDate = startDate;
    }

    public Date getEndDate()
    {
        return _endDate;
    }

    public void setEndDate(Date endDate)
    {
        _endDate = endDate;
    }

    public String getHistoryId()
    {
        return _historyId;
    }

    public void setHistoryId(String historyId)
    {
        _historyId = historyId;
    }
}
