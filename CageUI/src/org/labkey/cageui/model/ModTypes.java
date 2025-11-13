package org.labkey.cageui.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ModTypes {
    StandardFloor("sf"),
    MeshFloor("mf"),
    MeshFloorX2("dmf"),
    NoFloor("nf"),
    SolidDivider("sd"),
    PCDivider("pcd"),
    VCDivider("vcd"),
    PrivacyDivider("pd"),
    NoDivider("nd"),
    CTunnel("ct"),
    Extension("ex"),
    SPDivider("spd");

    private final String value;

    ModTypes(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ModTypes fromValue(String value) {
        for (ModTypes modType : ModTypes.values()) {
            if (modType.value.equals(value)) {
                return modType;
            }
        }
        throw new IllegalArgumentException("Unknown ModTypes value: " + value);
    }

    @Override
    public String toString() {
        return value;
    }
}
