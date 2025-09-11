package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RackTypes
{
    CAGE(4),
    PEN(5),
    TEMPCAGE(6),
    PLAYCAGE(7);

    private final int numericValue;

    RackTypes(int numericValue) {
        this.numericValue = numericValue;
    }

    @JsonValue  // Serialize using this value
    public int getNumericValue() {
        return numericValue;
    }

    @JsonCreator  // Deserialize using this method
    public static RackTypes fromNumericValue(int value) {
        for (RackTypes type : values()) {
            if (type.numericValue == value) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid RackTypes numeric value: " + value);
    }

}
