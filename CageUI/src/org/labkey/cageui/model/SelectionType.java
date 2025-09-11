package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SelectionType
{
    RACK("rack"),
    CAGE("cage"),
    OBJECT("obj"),
    RACKGROUP("rackGroup");

    private final String value;

    SelectionType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue()
    {
        return value;
    }

    // Optional: Convert from string to enum
    @JsonCreator
    public static SelectionType fromValue(String value)
    {
        for (SelectionType type : values())
        {
            if (type.value.equals(value))
            {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown SelectionType: " + value);
    }

    // Optional: Check if a string is valid
    public static boolean isValid(String value) {
        for (SelectionType type : values()) {
            if (type.value.equals(value)) {
                return true;
            }
        }
        return false;
    }
}
