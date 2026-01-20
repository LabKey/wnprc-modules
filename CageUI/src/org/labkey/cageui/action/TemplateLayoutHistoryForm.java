package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TemplateLayoutHistoryForm
{
    private Integer _rowid;
    @JsonProperty("historyid")
    private String _historyId;
    @JsonProperty("rack_group")
    private Integer _rackGroup;
    private Integer _rack;
    private Integer _cage;
    @JsonProperty("object_type")
    private int _objectType;
    @JsonProperty("extra_context")
    private String _extraContext;
    @JsonProperty("x_coord")
    private int _xCoord;
    @JsonProperty("y_coord")
    private int _yCoord;

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

    public Integer getRackGroup()
    {
        return _rackGroup;
    }

    public void setRackGroup(Integer rackGroup)
    {
        _rackGroup = rackGroup;
    }

    public Integer getRack()
    {
        return _rack;
    }

    public void setRack(Integer rack)
    {
        _rack = rack;
    }

    public Integer getCage()
    {
        return _cage;
    }

    public void setCage(Integer cage)
    {
        _cage = cage;
    }

    public int getObjectType()
    {
        return _objectType;
    }

    public void setObjectType(int objectType)
    {
        _objectType = objectType;
    }

    public String getExtraContext()
    {
        return _extraContext;
    }

    public void setExtraContext(String extraContext)
    {
        _extraContext = extraContext;
    }

    public int getxCoord()
    {
        return _xCoord;
    }

    public void setxCoord(int xCoord)
    {
        _xCoord = xCoord;
    }

    public int getyCoord()
    {
        return _yCoord;
    }

    public void setyCoord(int yCoord)
    {
        _yCoord = yCoord;
    }
}
