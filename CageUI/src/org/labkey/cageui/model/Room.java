package org.labkey.cageui.model;

import java.util.List;
import java.util.Map;

public class Room
{
    private String _name;
    private List<RackGroup> _rackGroups;
    private List<RoomObject> _objects;
    private LayoutData _layoutData;
    private Map<String, Object> _mods;

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

    public LayoutData getLayoutData()
    {
        return _layoutData;
    }

    public void setLayoutData(LayoutData layoutData)
    {
        _layoutData = layoutData;
    }

    public Map<String, Object>  getMods()
    {
        return _mods;
    }

    public void setMods(Map<String, Object>  mods)
    {
        _mods = mods;
    }
}
