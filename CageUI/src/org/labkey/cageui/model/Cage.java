package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Cage
{
    private String _svgId;
    private String _objectId;
    private int _positionId;
    private SelectionType _selectionType;
    private String _cageNum;
    private int _x;
    private int _y;
    private int _size;
    private Map<String, Object> _extraContext;
    @JsonProperty("mods")
    private Map<ModLocations, List<CageModKeyMap.CageModification>> _mods;


    public final class CageModKeyMap
    {
        public CageModKeyMap()
        {
            _mods = new HashMap<>();
        }

        @JsonCreator
        public CageModKeyMap(Map<String, List<CageModification>> modsMap)
        {
            _mods = new HashMap<>();

            if (modsMap != null)
            {
                for (Map.Entry<String, List<CageModification>> entry : modsMap.entrySet())
                {
                    try
                    {
                        ModLocations location = ModLocations.fromValue(entry.getKey());
                        _mods.put(location, entry.getValue());
                    }
                    catch (Exception e)
                    {
                        // Log warning but don't fail completely
                        System.err.println("Warning: Could not convert key '" + entry.getKey() + "' to ModLocations");
                    }
                }
            }

            // Initialize all locations to avoid NPE
            for (ModLocations location : ModLocations.values())
            {
                _mods.putIfAbsent(location, new ArrayList<>());
            }
        }

        // Helper methods for easier access
        public List<CageModification> getModificationsForLocation(ModLocations location)
        {
            return _mods.get(location);
        }

        public void addModification(ModLocations location, CageModification modification)
        {
            _mods.computeIfAbsent(location, k -> new ArrayList<>()).add(modification);
        }

        public boolean hasModificationsForLocation(ModLocations location)
        {
            return !getModificationsForLocation(location).isEmpty();
        }

        // Modification class
        public static final class CageModification
        {
            private final List<Modkeys> modKeys;
            private final int subId;

            @JsonCreator
            public CageModification(
                @JsonProperty("modKeys") List<Modkeys> modKeys,
                @JsonProperty("subId") int subId
            ){
                this.modKeys = modKeys != null ? modKeys : new ArrayList<>();
                this.subId = subId;
            }

            public int getSubId()
            {
                return subId;
            }

            public List<Modkeys> getModKeys()
            {
                return modKeys;
            }
        }
    }

    public boolean hasMods()
    {
        return _mods != null;
    }

    public Map<ModLocations, List<CageModKeyMap.CageModification>> getMods()
    {
        return _mods;
    }

    public void setMods(Map<ModLocations, List<CageModKeyMap.CageModification>> mods)
    {
        _mods = mods;
    }

    public String getObjectId()
    {
        return _objectId;
    }

    public void setObjectId(String objectId)
    {
        _objectId = objectId;
    }

    public String getSvgId()
    {
        return _svgId;
    }

    public void setSvgId(String svgId)
    {
        _svgId = svgId;
    }

    public int getPositionId()
    {
        return _positionId;
    }

    public void setPositionId(int positionId)
    {
        _positionId = positionId;
    }

    public SelectionType getSelectionType()
    {
        return _selectionType;
    }

    public void setSelectionType(SelectionType selectionType)
    {
        _selectionType = selectionType;
    }

    public String getCageNum()
    {
        return _cageNum;
    }

    public void setCageNum(String cageNum)
    {
        _cageNum = cageNum;
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

    public int getSize()
    {
        return _size;
    }

    public void setSize(int size)
    {
        _size = size;
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
