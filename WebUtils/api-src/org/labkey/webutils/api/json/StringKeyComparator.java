package org.labkey.webutils.api.json;

import org.json.JSONException;
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
    public int compare(JSONObject a, JSONObject b) {
        String valA = "";
        String valB = "";

        try {
            valA = a.getString(key);
            valB = b.getString(key);
        }
        catch (JSONException e) {
            //do something
        }

        return valA.compareTo(valB);
        //if you want to change the sort order, simply use the following:
        //return -valA.compareTo(valB);
    }
}
