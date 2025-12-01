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


    public static final class UnitType {
        private final int rowid;
        private final String name;
        private final RackTypes type;
        private final boolean isDefault;
        private final Map<ModLocations, Object> sides;

        @JsonCreator
        public UnitType(
            @JsonProperty("rowid") int rowid,
            @JsonProperty("name") String name,
            @JsonProperty("type") RackTypes type,
            @JsonProperty("isDefault") boolean isDefault,
            @JsonProperty("sides") Map<ModLocations, Object> sides)
        {
            this.rowid = rowid;
            this.name = name;
            this.type = type;
            this.isDefault = isDefault;
            this.sides = sides;
        }

        public RackTypes getEffectiveRackType() {
            if (isDefault()) {
                switch (type) {
                    case CAGE: return RackTypes.DEFAULTCAGE;
                    case PEN: return RackTypes.DEFAULTPEN;
                    case TEMPCAGE: return RackTypes.DEFAULTTEMPCAGE;
                    case PLAYCAGE: return RackTypes.DEFAULTPLAYCAGE;
                    default: return type; // fallback, though shouldn't happen
                }
            } else {
                return type;
            }
        }

        public Map<ModLocations, Object> getSides()
        {
            return sides;
        }

        public boolean isDefault()
        {
            return isDefault;
        }

        public RackTypes getRackType()
        {
            return type;
        }

        public String getName()
        {
            return name;
        }

        public int getRowId()
        {
            return rowid;
        }
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
