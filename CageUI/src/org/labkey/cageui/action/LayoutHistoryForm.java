package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.json.JSONObject;
import org.labkey.cageui.model.RackTypes;

import java.util.Date;

public class LayoutHistoryForm
{
    private int _rowid;
    @JsonProperty("historyid")
    private String _historyId;
    @JsonProperty("cage_historyid")
    private String _cageHistoryId;
    @JsonProperty("object_type")
    private int _objectType;
    @JsonProperty("extra_context")
    private String _extraContext;
    @JsonProperty("x_coord")
    private int _xCoord;
    @JsonProperty("y_coord")
    private int _yCoord;


    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public int getObjectType()
    {
        return _objectType;
    }

    public void setObjectType(int objectType)
    {
        _objectType = objectType;
    }

    public String getExtraContext()
    {
        return _extraContext;
    }

    public void setExtraContext(String extraContext)
    {
        _extraContext = extraContext;
    }

    public int getxCoord()
    {
        return _xCoord;
    }

    public void setxCoord(int xCoord)
    {
        _xCoord = xCoord;
    }

    public int getyCoord()
    {
        return _yCoord;
    }

    public void setyCoord(int yCoord)
    {
        _yCoord = yCoord;
    }

    public String getHistoryId()
    {
        return _historyId;
    }

    public void setHistoryId(String historyId)
    {
        _historyId = historyId;
    }

    public String getCageHistoryId()
    {
        return _cageHistoryId;
    }

    public void setCageHistoryId(String cageHistoryId)
    {
        _cageHistoryId = cageHistoryId;
    }
}
