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

package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CageUIRecordDeleteForm
{
    private boolean _enabled;
    private int hourOfDay;

    public boolean isEnabled()
    {
        return _enabled;
    }

    @JsonProperty("enabled")
    public void setEnabled(boolean enabled)
    {
        _enabled = enabled;
    }

    @JsonProperty("isEnabled")
    public void setIsEnabled(boolean enabled)
    {
        _enabled = enabled;
    }

    public int getHourOfDay()
    {
        return hourOfDay;
    }

    public void setHourOfDay(int hourOfDay)
    {
        this.hourOfDay = hourOfDay;
    }
}