package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

public class TemplateLayoutHistoryForm
{
    private int _rowid;
    @JsonProperty("historyid")
    private String _historyId;
    @JsonProperty("rack_group")
    private int _rackGroup;
    private int _rack;
    private String _cage;
    @JsonProperty("object_type")
    private int _objectType;
    @JsonProperty("extra_context")
    private String _extraContext;
    @JsonProperty("x_coord")
    private String _xCoord;
    @JsonProperty("y_coord")
    private String _yCoord;

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
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

    public int getRack()
    {
        return _rack;
    }

    public void setRack(int rack)
    {
        _rack = rack;
    }

    public String getCage()
    {
        return _cage;
    }

    public void setCage(String cage)
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

    public String getxCoord()
    {
        return _xCoord;
    }

    public void setxCoord(String xCoord)
    {
        _xCoord = xCoord;
    }

    public String getyCoord()
    {
        return _yCoord;
    }

    public void setyCoord(String yCoord)
    {
        _yCoord = yCoord;
    }
}
