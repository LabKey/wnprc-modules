package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.json.JSONObject;

import java.util.Date;

public class CageModificationHistoryForm
{
    private Integer _rowid;
    @JsonProperty("historyid")
    private String _historyId;
    @JsonProperty("modid")
    private String _modId;
    @JsonProperty("parent_modid")
    private String _parentModId;
    private String _modification;
    @JsonProperty("subid")
    private int _subId;
    private int _location;

    public int getSubId() {return _subId;}

    public void setSubId(int subId) {_subId = subId;}

    public int getLocation() {return _location;}

    public void setLocation(int location) {_location = location;}

    public String getModification() {return _modification;}

    public void setModification(String modification) {_modification = modification;}

    public String getModId() {return _modId;}

    public void setModId(String modId) {_modId = modId;}

    public Integer getRowid() {return _rowid;}

    public void setRowid(Integer rowid) {_rowid = rowid;}

    public String getParentModId() {return _parentModId;}

    public void setParentModId(String parentModId) {_parentModId = parentModId;}

    public String getHistoryId()
    {
        return _historyId;
    }

    public void setHistoryId(String historyId)
    {
        _historyId = historyId;
    }
}
