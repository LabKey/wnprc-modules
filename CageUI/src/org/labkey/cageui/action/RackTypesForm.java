package org.labkey.cageui.action;

import org.json.JSONObject;

public class RackTypesForm
{
    private int _rowid;
    private String _name;
    private int _type;
    private String _manufacturer;
    private Double _length;
    private Double _width;
    private Double _height;
    private Boolean _supportsTunnel;
    private String _description;

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public String getName()
    {
        return _name;
    }

    public void setName(String name)
    {
        _name = name;
    }

    public int getType()
    {
        return _type;
    }

    public void setType(int type)
    {
        _type = type;
    }

    public String getManufacturer()
    {
        return _manufacturer;
    }

    public void setManufacturer(String manufacturer)
    {
        _manufacturer = manufacturer;
    }

    public Double getLength()
    {
        return _length;
    }

    public void setLength(Double length)
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

    public Boolean getSupportsTunnel()
    {
        return _supportsTunnel;
    }

    public void setSupportsTunnel(Boolean supportsTunnel)
    {
        _supportsTunnel = supportsTunnel;
    }

    public String getDescription()
    {
        return _description;
    }

    public void setDescription(String description)
    {
        _description = description;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("rowid", getRowid());
        json.put("name", getName());
        json.put("type", getType());
        json.put("manufacturer", getManufacturer());
        json.put("length", getLength());
        json.put("width", getWidth());
        json.put("height", getHeight());
        json.put("supportsTunnel", getSupportsTunnel());
        json.put("description", getDescription());

        return json;
    }
}

