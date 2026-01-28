package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CageHistoryForm
{
    private Integer _rowid;
    @JsonProperty("historyid")
    private String _historyId;
    @JsonProperty("rack_group")
    private int _rackGroup;
    @JsonProperty("group_rotation")
    private int _groupRotation;
    private String _cage;
    @JsonProperty("cage_number")
    private int _cageNumber;
    private Double _length;
    private Double _width;
    private Double _height;
    private Double _sqft;

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

    public double getLength()
    {
        return _length;
    }

    public void setLength(double length)
    {
        _length = length;
    }

    public Double getWidth()
    {
        return _width;
    }

    public void setWidth(Double width)
    {
        _width = width;
    }

    public Double getHeight()
    {
        return _height;
    }

    public void setHeight(Double height)
    {
        _height = height;
    }

    public Double getSqft()
    {
        return _sqft;
    }

    public void setSqft(Double sqft)
    {
        _sqft = sqft;
    }

    public int getGroupRotation()
    {
        return _groupRotation;
    }

    public void setGroupRotation(int groupRotation)
    {
        _groupRotation = groupRotation;
    }
}
