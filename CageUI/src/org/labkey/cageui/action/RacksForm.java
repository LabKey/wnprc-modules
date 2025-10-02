package org.labkey.cageui.action;

import org.json.JSONObject;
import org.labkey.cageui.model.RackTypes;

public class RacksForm
{
    private int _rowid;
    private int _rackid;
    private String _room;
    private RackTypes _rack_type;

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public int getRackid()
    {
        return _rackid;
    }

    public void setRackid(int rackid)
    {
        _rackid = rackid;
    }

    public String getRoom()
    {
        return _room;
    }

    public void setRoom(String room)
    {
        _room = room;
    }

    public RackTypes getRack_type()
    {
        return _rack_type;
    }

    public void setRack_type(RackTypes rack_type)
    {
        _rack_type = rack_type;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("rowid", getRowid());
        json.put("rackid", getRackid());
        json.put("room", getRoom());
        json.put("rack_type", getRack_type().toString());

        return json;
    }
}
