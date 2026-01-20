package org.labkey.cageui.model;

import org.labkey.cageui.action.RoomHistoryForm;

import java.util.List;
import java.util.Map;

public class Room
{
    private String _name;
    private List<RackGroup> _rackGroups;
    private List<RoomObject> _objects;
    private RoomHistoryForm _roomHistoryForm;
    private Map<String, ModEntry> _mods;

    public String getName()
    {
        return _name;
    }

    public void setName(String name)
    {
        _name = name;
    }

    public List<RackGroup> getRackGroups()
    {
        return _rackGroups;
    }

    public void setRackGroups(List<RackGroup> rackGroups)
    {
        _rackGroups = rackGroups;
    }

    public List<RoomObject> getObjects()
    {
        return _objects;
    }

    public void setObjects(List<RoomObject> objects)
    {
        _objects = objects;
    }

    public RoomHistoryForm getLayoutData()
    {
        return _roomHistoryForm;
    }

    public void setLayoutData(RoomHistoryForm roomHistoryForm)
    {
        _roomHistoryForm = roomHistoryForm;
    }

    public Map<String, ModEntry> getMods()
    {
        return _mods;
    }

    public void setMods(Map<String, ModEntry> mods)
    {
        _mods = mods;
    }
}
