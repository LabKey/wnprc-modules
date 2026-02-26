package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ModLocations
{
    @JsonProperty("0")
    LEFT("0"),
    @JsonProperty("1")
    RIGHT("1"),
    @JsonProperty("2")
    TOP("2"),
    @JsonProperty("3")
    BOTTOM("3"),
    @JsonProperty("4")
    DIRECT("4");

    private final String numericString;

    ModLocations(String numericString)
    {
        this.numericString = numericString;
    }

    public String getNumericString()
    {
        return numericString;
    }

    public int toInt()
    {
        return Integer.parseInt(numericString);
    }

    public static ModLocations fromValue(String value)
    {
        for (ModLocations location : values())
        {
            if (location.numericString.equals(value))
            {
                return location;
            }
        }
        // Fallback: try to parse as integer and map
        try
        {
            int intValue = Integer.parseInt(value);
            return fromInt(intValue);
        }
        catch (NumberFormatException e)
        {
            throw new IllegalArgumentException("Invalid ModLocations value: " + value);
        }
    }

    public static ModLocations fromInt(int value)
    {
        for (ModLocations location : values())
        {
            if (location.toInt() == value)
            {
                return location;
            }
        }
        throw new IllegalArgumentException("Invalid ModLocations integer value: " + value);
    }
}