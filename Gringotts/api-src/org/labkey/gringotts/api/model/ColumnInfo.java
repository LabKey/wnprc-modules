package org.labkey.gringotts.api.model;

/**
 * Created by jon on 11/4/16.
 */
public class ColumnInfo {
    public final ValueType type;
    public final String columnName;
    public final String internalName;

    public ColumnInfo(ValueType type, String columnName, String internalName) {
        this.type = type;
        this.columnName = columnName;
        this.internalName = internalName;
    }

    public ColumnInfo(String type, String columnName, String internalName) {
        this(ValueType.valueOf(type), columnName, internalName);
    }

    @Override
    public boolean equals(Object o) {
        if (o instanceof ColumnInfo) {
            ColumnInfo that = (ColumnInfo) o;
            if (this.type.equals(that.type)
                    && this.columnName.equals(that.columnName)
                    && this.internalName.equals(that.internalName)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
}
