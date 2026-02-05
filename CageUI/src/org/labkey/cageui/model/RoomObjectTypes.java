package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RoomObjectTypes
{
    ROOMDIVIDER(100),
    DRAIN(101),
    DOOR(102),
    GATECLOSED(103),
    GATEOPEN(104),
    TOP(105),
    BOTTOM(106);

    private final int numericValue;

    RoomObjectTypes(int numericValue)
    {
        this.numericValue = numericValue;
    }

    @JsonValue  // Serialize using this value
    public int getNumericValue()
    {
        return numericValue;
    }

    @JsonCreator  // Deserialize using this method
    public static RoomObjectTypes fromNumericValue(int value)
    {
        for (RoomObjectTypes type : values())
        {
            if (type.numericValue == value)
            {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid RackTypes numeric value: " + value);
    }

}