package org.labkey.cageui.action;

import org.json.JSONObject;
import org.labkey.cageui.model.RackTypes;

import java.util.Date;

public class LayoutHistoryForm
{
    private int _rowid;
    private int _object_type;
    private Integer _rack_group;
    private String _extra_context;
    private String _cage;
    private String _x_coord;
    private String _y_coord;
    private Date _start_date;
    private Date _end_date;

    public String getCage()
    {
        return _cage;
    }

    public void setCage(String cage)
    {
        _cage = cage;
    }

    public Date getStart_date()
    {
        return _start_date;
    }

    public void setStart_date(Date start_date)
    {
        _start_date = start_date;
    }

    public Date getEnd_date()
    {
        return _end_date;
    }

    public void setEnd_date(Date end_date)
    {
        _end_date = end_date;
    }

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public int getObject_type()
    {
        return _object_type;
    }

    public void setObject_type(int object_type)
    {
        _object_type = object_type;
    }

    public Integer getRack_group()
    {
        return _rack_group;
    }

    public void setRack_group(Integer rack_group)
    {
        _rack_group = rack_group;
    }

    public String getExtra_context()
    {
        return _extra_context;
    }

    public void setExtra_context(String extra_context)
    {
        _extra_context = extra_context;
    }

    public String getX_coord()
    {
        return _x_coord;
    }

    public void setX_coord(String xCoord)
    {
        _x_coord = xCoord;
    }

    public String getY_coord()
    {
        return _y_coord;
    }

    public void setY_coord(String yCoord)
    {
        _y_coord = yCoord;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("rowid", getRowid());
        json.put("cage", getCage());
        json.put("object_type", getObject_type());
        json.put("extra_context", getExtra_context());
        json.put("rack_group", getRack_group());
        json.put("x_coord", getX_coord());
        json.put("y_coord", getY_coord());
        json.put("start_date", getStart_date());
        json.put("end_date", getEnd_date());

        return json;
    }


}
