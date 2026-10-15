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

public enum AdoptionType
{
    START(0),
    END(1),
    PAUSE(2),
    RESUME(3);

    private final int _value;

    AdoptionType(int value)
    {
        _value = value;
    }

    public int getValue()
    {
        return _value;
    }

    public static AdoptionType fromInt(int value)
    {
        for (AdoptionType type : AdoptionType.values())
        {
            if (type.getValue() == value)
            {
                return type;
            }
        }
        return null;
    }
}
