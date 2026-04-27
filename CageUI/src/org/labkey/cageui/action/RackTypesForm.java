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

public class RackTypesForm
{
    private int _rowid;
    private String _displayName;
    private Double _size;
    private int _type;
    private String _manufacturer;
    private boolean _stationary;
    private Double _length;
    private Double _width;
    private Double _height;
    private String _description;

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public Double getSize()
    {
        return _size;
    }

    public void setSize(Double size)
    {
        _size = size;
    }

    public int getType()
    {
        return _type;
    }

    public void setType(int type)
    {
        _type = type;
    }

    public String getManufacturer()
    {
        return _manufacturer;
    }

    public void setManufacturer(String manufacturer)
    {
        _manufacturer = manufacturer;
    }

    public Double getLength()
    {
        return _length;
    }

    public void setLength(Double length)
    {
        _length = length;
    }

    public Double getWidth()
    {
        return _width;
    }

    public void setWidth(Double width)
    {
        _width = width;
    }

    public Double getHeight()
    {
        return _height;
    }

    public void setHeight(Double height)
    {
        _height = height;
    }

    public String getDescription()
    {
        return _description;
    }

    public void setDescription(String description)
    {
        _description = description;
    }

    public boolean isStationary()
    {
        return _stationary;
    }

    public void setStationary(boolean stationary)
    {
        _stationary = stationary;
    }

    public String getDisplayName()
    {
        return _displayName;
    }

    public void setDisplayName(String displayName)
    {
        _displayName = displayName;
    }
}

