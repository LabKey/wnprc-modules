package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ModLocations
{
    LEFT("0"),
    RIGHT("1"),
    TOP("2"),
    BOTTOM("3"),
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

    @JsonCreator
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