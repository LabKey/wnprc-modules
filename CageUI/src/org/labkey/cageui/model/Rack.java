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

import java.util.List;
import java.util.Map;
import java.util.Optional;

public class Rack
{
    private int _itemId;
    private String _svgId;
    private String _objectId;
    private SelectionType _selectionType;
    private List<Cage> _cages;
    private UnitType _type;
    private int _condition;
    private int _x;
    private int _y;
    private boolean _isNew;
    private boolean _isActive; // nullable
    private Map<String, Object> _extraContext; // nullable

    public int getItemId()
    {
        return _itemId;
    }

    public void setItemId(int itemId)
    {
        _itemId = itemId;
    }

    public String getObjectId()
    {
        return _objectId;
    }

    public void setObjectId(String objectId)
    {
        _objectId = objectId;
    }

    public SelectionType getSelectionType()
    {
        return _selectionType;
    }

    public void setSelectionType(SelectionType selectionType)
    {
        _selectionType = selectionType;
    }

    public List<Cage> getCages()
    {
        return _cages;
    }

    public void setCages(List<Cage> cages)
    {
        _cages = cages;
    }

    public UnitType getType()
    {
        return _type;
    }

    public void setType(UnitType type)
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

    public boolean getIsActive()
    {
        return _isActive;
    }

    public void setIsActive(boolean isActive)
    {
        _isActive = isActive;
    }

    public Map<String, Object> getExtraContext()
    {
        return _extraContext;
    }

    public void setExtraContext(Map<String, Object> extraContext)
    {
        _extraContext = extraContext;
    }

    public boolean getIsNew()
    {
        return _isNew;
    }

    public void setIsNew(boolean isNew)
    {
        _isNew = isNew;
    }

    public String getSvgId()
    {
        return _svgId;
    }

    public void setSvgId(String svgId)
    {
        _svgId = svgId;
    }

    public int getCondition()
    {
        return _condition;
    }

    public void setCondition(int condition)
    {
        _condition = condition;
    }


    public static final class UnitType {
        private final int rowid;
        private final String displayName;
        private final RackTypes type;
        private final boolean isDefault;
        private final Double size;
        private final Manufacturer manufacturer;
        private final boolean stationary;

        @JsonCreator
        public UnitType(
                @JsonProperty("rowid") int rowid,
                @JsonProperty("displayName") String displayName,
                @JsonProperty("type") RackTypes type,
                @JsonProperty("isDefault") boolean isDefault,
                @JsonProperty("size") Double size,
                @JsonProperty("manufacturer") Manufacturer manufacturer,
                @JsonProperty("stationary") boolean stationary) {
            this.rowid = rowid;
            this.displayName = displayName;
            this.type = type;
            this.isDefault = isDefault;
            this.size = size;
            this.manufacturer = manufacturer;
            this.stationary = stationary;
        }

        public RackTypes getEffectiveRackType() {
            if (isDefault()) {
                switch (type) {
                    case CAGE:
                        return RackTypes.DEFAULTCAGE;
                    case PEN:
                        return RackTypes.DEFAULTPEN;
                    case TEMPCAGE:
                        return RackTypes.DEFAULTTEMPCAGE;
                    case PLAYCAGE:
                        return RackTypes.DEFAULTPLAYCAGE;
                    default:
                        return type; // fallback, though shouldn't happen
                }
            } else {
                return type;
            }
        }

        @JsonProperty("isDefault")
        public boolean isDefault() {
            return isDefault;
        }

        @JsonProperty("type")
        public RackTypes getRackType() {
            return type;
        }

        public String getDisplayName() {
            return displayName;
        }
        @JsonProperty("rowid")
        public int getRowId() {
            return rowid;
        }

        public Double getSize() {
            return size;
        }

        public Manufacturer getManufacturer()
        {
            return manufacturer;
        }

        public boolean isStationary() {
            return stationary;
        }

        // Inner class for Manufacturer

    }


    // Check if string matches either pattern
    public static boolean isValidItemId(String itemId)
    {
        return isDefaultRackId(itemId) || isRealRackId(itemId);
    }

    public static boolean isDefaultRackId(String itemId)
    {
        return itemId != null && itemId.matches("^default-rack-\\d+$");
    }

    public static boolean isRealRackId(String itemId)
    {
        return itemId != null && itemId.matches("^rack-\\d+$");
    }

    // Extract the number from either format
    public static Optional<Integer> extractNumber(String itemId)
    {
        if (!isValidItemId(itemId))
        {
            return Optional.empty();
        }
        try
        {
            String numberPart = itemId.substring(itemId.lastIndexOf("-") + 1);
            return Optional.of(Integer.parseInt(numberPart));
        }
        catch (NumberFormatException e)
        {
            return Optional.empty();
        }
    }
}
