package org.labkey.cageui.action;

import org.json.JSONObject;

import java.util.Date;

public class CageModificationHistoryForm
{
    private int _rowid;
    private int _rack;
    private int _cage;
    private int _subId;
    private int _location;
    private String _modification;
    private String _modId;
    private String _parentModId;
    private String _room;
    private Date _startDate;
    private Date _endDate;

    public int getRack() {return _rack;}

    public void setRack(int rack) {_rack = rack;}

    public int getCage() {return _cage;}

    public void setCage(int cage) {_cage = cage;}

    public int getSubId() {return _subId;}

    public void setSubId(int subId) {_subId = subId;}

    public int getLocation() {return _location;}

    public void setLocation(int location) {_location = location;}

    public String getModification() {return _modification;}

    public void setModification(String modification) {_modification = modification;}

    public String getModId() {return _modId;}

    public void setModId(String modId) {_modId = modId;}

    public String getRoom() {return _room;}

    public void setRoom(String room) {_room = room;}

    public Date getStartDate() {return _startDate;}

    public void setStartDate(Date startDate) {_startDate = startDate;}

    public Date getEndDate() {return _endDate;}

    public void setEndDate(Date endDate) {_endDate = endDate;}

    public int getRowid() {return _rowid;}

    public void setRowid(int rowid) {_rowid = rowid;}

    public String getParentModId() {return _parentModId;}

    public void setParentModId(String parentModId) {_parentModId = parentModId;}

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("rowid", getRowid());
        json.put("rack", getRack());
        json.put("cage", getCage());
        json.put("subId", getSubId());
        json.put("location", getLocation());
        json.put("modification", getModification());
        json.put("modId", getModId());
        json.put("parentModId",getParentModId());
        json.put("room", getRoom());
        json.put("startDate", getStartDate());
        json.put("endDate", getEndDate());

        return json;
    }
}
