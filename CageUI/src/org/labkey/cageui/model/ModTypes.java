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

public enum ModTypes
{
    StandardFloor("sf"),
    MeshFloor("mf"),
    MeshFloorX2("dmf"),
    NoFloor("nf"),
    SolidDivider("sd"),
    PCDivider("pcd"),
    VCDivider("vcd"),
    PrivacyDivider("pd"),
    NoDivider("nd"),
    CTunnel("ct"),
    Extension("ex"),
    SPDivider("spd");

    private final String value;

    ModTypes(String value)
    {
        this.value = value;
    }

    @JsonValue
    public String getValue()
    {
        return value;
    }

    @JsonCreator
    public static ModTypes fromValue(String value)
    {
        for (ModTypes modType : ModTypes.values())
        {
            if (modType.value.equals(value))
            {
                return modType;
            }
        }
        throw new IllegalArgumentException("Unknown ModTypes value: " + value);
    }

    @Override
    public String toString()
    {
        return value;
    }
}
