package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Manufacturer {
    private String _value;
    private String _title;

    public Manufacturer(){

    }

    @JsonCreator
    public Manufacturer(
            @JsonProperty("value") String value,
            @JsonProperty("title") String title) {
        _value = value;
        _title = title;
    }

    public String getValue()
    {
        return _value;
    }

    public void setValue(String value)
    {
        _value = value;
    }

    public String getTitle()
    {
        return _title;
    }

    public void setTitle(String title)
    {
        _title = title;
    }
}