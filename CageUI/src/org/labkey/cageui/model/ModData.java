package org.labkey.cageui.model;

import org.json.JSONObject;

public class ModData
{
    private String _modId;
    private String _parentModId;
    private String _rack;
    private String _cage;
    private ModTypes _modification;
    private ModLocations _location;
    private int _subId;

    public String getModId()
    {
        return _modId;
    }

    public void setModId(String modId)
    {
        _modId = modId;
    }

    public String getParentModId()
    {
        return _parentModId;
    }

    public void setParentModId(String parentModId)
    {
        _parentModId = parentModId;
    }

    public String getRack()
    {
        return _rack;
    }

    public void setRack(String rack)
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

    public ModTypes getModification()
    {
        return _modification;
    }

    public void setModification(ModTypes modification)
    {
        _modification = modification;
    }

    public ModLocations getLocation()
    {
        return _location;
    }

    public void setLocation(ModLocations location)
    {
        _location = location;
    }

    public int getSubId()
    {
        return _subId;
    }

    public void setSubId(int subId)
    {
        _subId = subId;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("modId", getModId());
        json.put("parentModId", getParentModId());
        json.put("rack", getRack());
        json.put("cage", getCage());
        json.put("modification", getModification().toString());
        json.put("location", getLocation().toString());
        json.put("subId", getSubId());

        return json;
    }
}
