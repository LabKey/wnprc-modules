package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.json.JSONObject;

public class CagesForm
{
    private int _rowid;
    @JsonProperty("objectid")
    private String _objectId;
    @JsonProperty("positionid")
    private int _positionId;
    private String _rack;
    @JsonProperty("cage_number")
    private int _cageNumber;
    private Integer _length;
    private Integer _width;
    private Integer _height;

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public String getObjectId()
    {
        return _objectId;
    }

    public void setObjectId(String objectId)
    {
        _objectId = objectId;
    }

    public String getRack()
    {
        return _rack;
    }

    public void setRack(String rack)
    {
        _rack = rack;
    }

    public int getCageNumber()
    {
        return _cageNumber;
    }

    public void setCageNumber(int cageNumber)
    {
        _cageNumber = cageNumber;
    }

    public Integer getLength()
    {
        return _length;
    }

    public void setLength(Integer length)
    {
        _length = length;
    }

    public Integer getWidth()
    {
        return _width;
    }

    public void setWidth(Integer width)
    {
        _width = width;
    }

    public Integer getHeight()
    {
        return _height;
    }

    public void setHeight(Integer height)
    {
        _height = height;
    }

    public int getPositionId()
    {
        return _positionId;
    }

    public void setPositionId(int positionId)
    {
        _positionId = positionId;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("rowid", getRowid());
        json.put("objectid", getObjectId());
        json.put("positionid", getPositionId());
        json.put("rack", getRack());
        json.put("cage_number", getCageNumber());
        json.put("length", getLength());
        json.put("width", getWidth());
        json.put("height", getHeight());

        return json;
    }
}

