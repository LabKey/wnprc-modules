package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public class Rack
{
    private String _itemId;
    private int _rowid;
    private SelectionType _selectionType;
    private List<Cage> _cages;
    private UnitType _type;
    private int _x;
    private int _y;
    private boolean _isActive; // nullable
    private Map<String, Object> _extraContext; // nullable

    public String getItemId()
    {
        return _itemId;
    }

    public void setItemId(String itemId)
    {
        _itemId = itemId;
    }

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
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
