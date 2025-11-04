package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CageHistoryForm
{
    private Integer _rowid;
    @JsonProperty("historyid")
    private String _historyId;
    @JsonProperty("rack_group")
    private int _rackGroup;
    private int _cage;
    @JsonProperty("mod_historyid")
    private String _modHistoryId;

    public Integer getRowid()
    {
        return _rowid;
    }

    public void setRowid(Integer rowid)
    {
        _rowid = rowid;
    }

    public String getHistoryId()
    {
        return _historyId;
    }

    public void setHistoryId(String historyId)
    {
        _historyId = historyId;
    }

    public int getRackGroup()
    {
        return _rackGroup;
    }

    public void setRackGroup(int rackGroup)
    {
        _rackGroup = rackGroup;
    }

    public int getCage()
    {
        return _cage;
    }

    public void setCage(int cage)
    {
        _cage = cage;
    }

    public String getModHistoryId()
    {
        return _modHistoryId;
    }

    public void setModHistoryId(String modHistoryId)
    {
        _modHistoryId = modHistoryId;
    }
}
