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

import com.fasterxml.jackson.annotation.JsonProperty;

public class RoomHistoryForm
{
    private int _scale;
    @JsonProperty("border_width")
    private int _borderWidth;
    @JsonProperty("border_height")
    private int _borderHeight;
    @JsonProperty("historyid")
    private String _historyId;

    public int getScale()
    {
        return _scale;
    }

    public void setScale(int scale)
    {
        _scale = scale;
    }

    public int getBorderWidth()
    {
        return _borderWidth;
    }

    public void setBorderWidth(int borderWidth)
    {
        _borderWidth = borderWidth;
    }

    public int getBorderHeight()
    {
        return _borderHeight;
    }

    public void setBorderHeight(int borderHeight)
    {
        _borderHeight = borderHeight;
    }

    public String getHistoryId()
    {
        return _historyId;
    }

    public void setHistoryId(String historyId)
    {
        _historyId = historyId;
    }
}
