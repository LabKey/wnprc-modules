package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.json.JSONObject;
import org.labkey.cageui.model.RackTypes;

public class RacksForm
{
    private int _rowid;
    @JsonProperty("objectid")
    private String _objectId;
    @JsonProperty("rackid")
    private int _rackId;
    private String _room;
    @JsonProperty("rack_type")
    private int _rackType; // rowid of racktype

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

    public int getRackId()
    {
        return _rackId;
    }

    public void setRackId(int rackId)
    {
        _rackId = rackId;
    }

    public String getRoom()
    {
        return _room;
    }

    public void setRoom(String room)
    {
        _room = room;
    }

    public int getRackType()
    {
        return _rackType;
    }

    public void setRackType(int rackType)
    {
        _rackType = rackType;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("rowid", getRowid());
        json.put("objectid", getObjectId());
        json.put("rackid", getRackId());
        json.put("room", getRoom());
        json.put("rack_type", getRackType());

        return json;
    }
}
