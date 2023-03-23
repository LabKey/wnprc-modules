package org.labkey.dbutils.jooq;

import org.jooq.Field;
import org.jooq.Record;
import org.jooq.TableRecord;
import org.json.old.JSONObject;

/**
 * Created by jon on 3/29/17.
 */
public class RecordUtils {
    public static JSONObject getJSON(Record record) {
        return _getJSON(record, false);
    }

    public static JSONObject getJSONForPKs(Record record) {
        return _getJSON(record, true);
    }

    private static JSONObject _getJSON(Record record, boolean onlyPKs) {
        JSONObject json = new JSONObject();

        Field[] fieldsToAddToJSON = record.fields();

        if (onlyPKs && record instanceof TableRecord) {
            fieldsToAddToJSON = ((TableRecord) record).getTable().getPrimaryKey().getFieldsArray();
        }

        for (Field field : fieldsToAddToJSON) {
            String fieldName = field.getName();
            Object value = record.getValue(field);

            json.put(fieldName, value);
        }

        return json;
    }
}
