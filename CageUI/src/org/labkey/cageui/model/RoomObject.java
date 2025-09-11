package org.labkey.cageui.model;

public class RoomObject
{
    private String _itemId;
    private SelectionType selectionType;
    private RoomObjectTypes _type;
    private int _x;
    private int _y;
    private int _scale;
    private String _extraContext;

    public String getItemId()
    {
        return _itemId;
    }

    public void setItemId(String itemId)
    {
        _itemId = itemId;
    }

    public SelectionType getSelectionType()
    {
        return selectionType;
    }

    public void setSelectionType(SelectionType selectionType)
    {
        this.selectionType = selectionType;
    }

    public RoomObjectTypes getType()
    {
        return _type;
    }

    public void setType(RoomObjectTypes type)
    {
        _type = type;
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

    public String getExtraContext()
    {
        return _extraContext;
    }

    public void setExtraContext(String extraContext)
    {
        _extraContext = extraContext;
    }
}
