package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CageHistoryForm
{
    private Integer _rowid;
    @JsonProperty("historyid")
    private String _historyId;
    @JsonProperty("rack_group")
    private int _rackGroup;
    private String _cage;
    @JsonProperty("cage_number")
    private int _cageNumber;
    private int _length;
    private int _width;
    private int _height;

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

    public String getCage()
    {
        return _cage;
    }

    public void setCage(String cage)
    {
        _cage = cage;
    }

    public int getCageNumber()
    {
        return _cageNumber;
    }

    public void setCageNumber(int cageNumber)
    {
        _cageNumber = cageNumber;
    }

    public int getLength()
    {
        return _length;
    }

    public void setLength(int length)
    {
        _length = length;
    }

    public int getWidth()
    {
        return _width;
    }

    public void setWidth(int width)
    {
        _width = width;
    }

    public int getHeight()
    {
        return _height;
    }

    public void setHeight(int height)
    {
        _height = height;
    }
}
