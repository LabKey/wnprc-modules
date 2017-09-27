package org.labkey.dbutils.api;

/**
 * Created by jon on 3/17/16.
 */
public interface FieldSet<RowType> {
    String getValueForField(RowType row);
}