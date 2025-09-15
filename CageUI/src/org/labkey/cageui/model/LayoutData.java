package org.labkey.cageui.model;

public class LayoutData
{
    private int _scale;
    private int _borderWidth;
    private int _borderHeight;
    private boolean _status;

    public int getScale()
    {
        return _scale;
    }

    public void setScale(int scale)
    {
        _scale = scale;
    }

    public int getBorderWidth()
    {
        return _borderWidth;
    }

    public void setBorderWidth(int borderWidth)
    {
        _borderWidth = borderWidth;
    }

    public int getBorderHeight()
    {
        return _borderHeight;
    }

    public void setBorderHeight(int borderHeight)
    {
        _borderHeight = borderHeight;
    }

    public boolean getStatus()
    {
        return _status;
    }

    public void setStatus(boolean status)
    {
        _status = status;
    }
}
