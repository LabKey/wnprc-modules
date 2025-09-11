package org.labkey.cageui.action;

import org.json.JSONObject;

import java.util.Date;

public class LayoutHistoryForm
{
    private int _rowid;
    private int _rack;
    private int _objectType;
    private int _rackGroup;
    private String _extraContext;
    private String _cage;
    private String _xCoord;
    private String _yCoord;
    private String _room;
    private Date _startDate;
    private Date _endDate;

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

    public String getRoom()
    {
        return _room;
    }

    public void setRoom(String room)
    {
        _room = room;
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

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public int getObjectType()
    {
        return _objectType;
    }

    public void setObjectType(int objectType)
    {
        _objectType = objectType;
    }

    public int getRackGroup()
    {
        return _rackGroup;
    }

    public void setRackGroup(int rackGroup)
    {
        _rackGroup = rackGroup;
    }

    public String getExtraContext()
    {
        return _extraContext;
    }

    public void setExtraContext(String extraContext)
    {
        _extraContext = extraContext;
    }

    public String getXCoord()
    {
        return _xCoord;
    }

    public void setXCoord(String xCoord)
    {
        _xCoord = xCoord;
    }

    public String getYCoord()
    {
        return _yCoord;
    }

    public void setYCoord(String yCoord)
    {
        _yCoord = yCoord;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("rowid", getRowid());
        json.put("rack", getRack());
        json.put("cage", getCage());
        json.put("objectType", getObjectType());
        json.put("extraContext", getExtraContext());
        json.put("rackGroup", getRackGroup());
        json.put("xCoord", getXCoord());
        json.put("yCoord", getYCoord());
        json.put("room", getRoom());
        json.put("startDate", getStartDate());
        json.put("endDate", getEndDate());

        return json;
    }


}
