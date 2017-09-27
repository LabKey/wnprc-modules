package org.labkey.gringotts.api.model;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.joda.time.DateTime;

/**
 * Created by jon on 10/20/16.
 */
public enum ValueType {
    TEXT,
    DATETIME,
    INTEGER;

    @Nullable
    public static ValueType getFromName(String name) {
        for (ValueType valueType : ValueType.values()) {
            if (valueType.name().equalsIgnoreCase(name)) {
                return valueType;
            }
        }
        return null;
    }

    public static ValueType getFromClass(@NotNull Class clazz) {
        if (clazz.isAssignableFrom(DateTime.class)) {
            return DATETIME;
        }
        else if (clazz.isAssignableFrom(Integer.class)) {
            return INTEGER;
        }
        else if (clazz.isAssignableFrom(String.class)) {
            return TEXT;
        }
        else {
            return null;
        }
    }
}
