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

import java.util.Map;

public class RoomObject
{
    private String _itemId;
    private SelectionType selectionType;
    private RoomObjectTypes _type;
    private int _x;
    private int _y;
    private int _scale;
    private Map<String, Object> _extraContext;

    public String getItemId()
    {
        return _itemId;
    }

    public void setItemId(String itemId)
    {
        _itemId = itemId;
    }

    public SelectionType getSelectionType()
    {
        return selectionType;
    }

    public void setSelectionType(SelectionType selectionType)
    {
        this.selectionType = selectionType;
    }

    public RoomObjectTypes getType()
    {
        return _type;
    }

    public void setType(RoomObjectTypes type)
    {
        _type = type;
    }

    public int getX()
    {
        return _x;
    }

    public void setX(int x)
    {
        _x = x;
    }

    public int getY()
    {
        return _y;
    }

    public void setY(int y)
    {
        _y = y;
    }

    public int getScale()
    {
        return _scale;
    }

    public void setScale(int scale)
    {
        _scale = scale;
    }

    public Map<String, Object> getExtraContext()
    {
        return _extraContext;
    }

    public void setExtraContext(Map<String, Object> extraContext)
    {
        _extraContext = extraContext;
    }
}
