package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RoomHistoryForm
{
    private int _scale;
    @JsonProperty("border_width")
    private int _borderWidth;
    @JsonProperty("border_height")
    private int _borderHeight;
    @JsonProperty("historyid")
    private String _historyId;

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

    public String getHistoryId()
    {
        return _historyId;
    }

    public void setHistoryId(String historyId)
    {
        _historyId = historyId;
    }
}
