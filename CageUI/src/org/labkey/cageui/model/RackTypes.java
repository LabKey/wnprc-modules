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
import com.fasterxml.jackson.annotation.JsonValue;

public enum RackTypes
{
    DEFAULTCAGE(0),
    DEFAULTPEN(1),
    DEFAULTTEMPCAGE(2),
    DEFAULTPLAYCAGE(3),
    CAGE(4),
    PEN(5),
    TEMPCAGE(6),
    PLAYCAGE(7);

    private final int numericValue;

    RackTypes(int numericValue)
    {
        this.numericValue = numericValue;
    }

    @JsonValue  // Serialize using this value
    public int getNumericValue()
    {
        return numericValue;
    }

    @JsonCreator  // Deserialize using this method
    public static RackTypes fromNumericValue(int value)
    {
        for (RackTypes type : values())
        {
            if (type.numericValue == value)
            {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid RackTypes numeric value: " + value);
    }

    public static String getName(RackTypes value)
    {
        switch (value)
        {
            case DEFAULTCAGE:
                return "Default Cage";
            case DEFAULTPEN:
                return "Default Pen";
            case DEFAULTTEMPCAGE:
                return "Default Temp Cage";
            case DEFAULTPLAYCAGE:
                return "Default Play Cage";
            case CAGE:
                return "Cage";
            case PEN:
                return "Pen";
            case TEMPCAGE:
                return "Temp Cage";
            case PLAYCAGE:
                return "Play Cage";
            default:
                throw new IllegalArgumentException("Invalid status value: " + value);
        }
    }

    public static String getSvgName(RackTypes value)
    {
        switch (value)
        {
            case DEFAULTCAGE:
                return "defaultCage";
            case DEFAULTPEN:
                return "defaultPen";
            case DEFAULTTEMPCAGE:
                return "defaultTempCage";
            case DEFAULTPLAYCAGE:
                return "defaultPlayCage";
            case CAGE:
                return "cage";
            case PEN:
                return "pen";
            case TEMPCAGE:
                return "tempCage";
            case PLAYCAGE:
                return "playCage";
            default:
                throw new IllegalArgumentException("Invalid status value: " + value);
        }
    }

}
