package org.labkey.webutils.api.json;

import org.json.JSONObject;

import java.util.Comparator;

/**
 * Created by jon on 2/14/17.
 */
public class NumberKeyComparator implements Comparator<JSONObject> {
    // Always sort blank values last.
    public double defaultValue = Double.MAX_VALUE;

    private String key;

    public NumberKeyComparator(String key) {
        this.key = key;
    }

    @Override
    public int compare(JSONObject a, JSONObject b) {
        // If either is missing the key (or the key is null), push it to the end of the sorted list.
        if (!a.has(key) || a.isNull(key)) {
            if (b.isNull(key) || !b.has(key)) {
                return 0;
            }
            return +1;
        }
        else if (!b.has(key) || b.isNull(key)) {
            return -1;
        }

        Double valA = a.optDouble(key, defaultValue);
        Double valB = b.optDouble(key, defaultValue);

        return valA.compareTo(valB);
        //if you want to change the sort order, simply use the following:
        //return -valA.compareTo(valB);
    }
}
