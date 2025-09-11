package org.labkey.cageui.model;

import java.util.List;

public class RackGroup
{

    private List<Rack> _racks;
    private SelectionType _selectionType;
    private String _groupId;
    private int _x;
    private int _y;
    private int _scale;

    public List<Rack> getRacks()
    {
        return _racks;
    }

    public void setRacks(List<Rack> racks)
    {
        _racks = racks;
    }

    public SelectionType getSelectionType()
    {
        return _selectionType;
    }

    public void setSelectionType(SelectionType selectionType)
    {
        _selectionType = selectionType;
    }

    public String getGroupId()
    {
        return _groupId;
    }

    public void setGroupId(String groupId)
    {
        _groupId = groupId;
    }

    public int getX()
    {
        return _x;
    }

    public void setX(int x)
    {
        _x = x;
    }

    public int getY()
    {
        return _y;
    }

    public void setY(int y)
    {
        _y = y;
    }

    public int getScale()
    {
        return _scale;
    }

    public void setScale(int scale)
    {
        _scale = scale;
    }
}
