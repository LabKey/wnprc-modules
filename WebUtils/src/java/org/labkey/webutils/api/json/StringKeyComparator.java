package org.labkey.webutils.api.json;

import org.json.JSONObject;

import java.util.Comparator;

/**
 * Created by jon on 4/15/16.
 */
public class StringKeyComparator implements Comparator<JSONObject> {
    private String key;

    public StringKeyComparator(String key) {
        this.key = key;
    }

    @Override
    /*
     * a < b --> -1
     * a = b -->  0
     * a > b --> +1
     *
     */
    public int compare(JSONObject a, JSONObject b) {
        // If either is missing the key (or the key is null), push it to the end of the sorted list.
        if (!a.has(key) || a.isNull(key)) {
            if (b.isNull(key) || !b.has(key)) {
                return 0;
            }
            return +1;
        } else if (!b.has(key) || b.isNull(key)) {
            return -1;
        }

        String valA = a.optString(key, "");
        String valB = b.optString(key, "");

        return valA.compareTo(valB);
        //if you want to change the sort order, simply use the following:
        //return -valA.compareTo(valB);
    }
}
