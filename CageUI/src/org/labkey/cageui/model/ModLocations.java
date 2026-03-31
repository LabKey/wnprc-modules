/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

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