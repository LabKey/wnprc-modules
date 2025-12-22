package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonCreator;
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
    private CageModKeyMap _mods;




    public static final class CageModKeyMap {
        private final Map<ModLocations, List<CageModification>> mods;

        public CageModKeyMap()
        {
            this.mods = new HashMap<>();
        }

        @JsonCreator
        public CageModKeyMap(Map<String, List<CageModification>> modsMap)
        {
            this.mods = new HashMap<>();

            if (modsMap != null)
            {
                for (Map.Entry<String, List<CageModification>> entry : modsMap.entrySet())
                {
                    try
                    {
                        ModLocations location = ModLocations.valueOf(entry.getKey());
                        this.mods.put(location, entry.getValue());
                    }
                    catch (IllegalArgumentException e)
                    {
                        // Ignore unknown locations or log warning
                    }
                }
            }

            // Initialize all locations to avoid NPE
            for (ModLocations location : ModLocations.values())
            {
                this.mods.putIfAbsent(location, new ArrayList<>());
            }
        }

        public Map<ModLocations, List<CageModification>> getMods() {
            return mods;
        }

        // Helper methods for easier access
        public List<CageModification> getModificationsForLocation(ModLocations location) {
            return mods.getOrDefault(location, new ArrayList<>());
        }

        public void addModification(ModLocations location, CageModification modification) {
            mods.computeIfAbsent(location, k -> new ArrayList<>()).add(modification);
        }

        public boolean hasModificationsForLocation(ModLocations location) {
            return !getModificationsForLocation(location).isEmpty();
        }

        // Modification class
        public static final class CageModification {
            private final List<Modkeys> modKeys;
            private final int subId;

            @JsonCreator
            public CageModification(@JsonProperty("modKeys") List<Modkeys> modKeys, @JsonProperty("subId") int subId)
            {
                this.modKeys = modKeys != null ? modKeys : new ArrayList<>();
                this.subId = subId;
            }

            public int getSubId() {
                return subId;
            }

            public List<Modkeys> getModKeys() {
                return modKeys;
            }
        }
    }

    public boolean hasMods() {
        return _mods != null;
    }

    public CageModKeyMap getModsOrDefault() {
        return _mods != null ? _mods : new CageModKeyMap(new HashMap<>());
    }


    public CageModKeyMap getMods()
    {
        return _mods;
    }

    public void setMods(CageModKeyMap mods)
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
