package org.labkey.webutils.api.json;

import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.webutils.api.json.StringKeyComparator;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Created by jon on 4/15/16.
 */
public class JsonUtils {
    public static JSONArray sortJsonArray(JSONArray jsonArray, Comparator<JSONObject> comparator) {
        List<JSONObject> jsonList = getListFromJSONArray(jsonArray);

        Collections.sort(jsonList, comparator);

        return getJSONArrayFromList(jsonList);
    }

    public static JSONArray sortJsonArrayByKey(JSONArray jsonArray, String key) {
        return sortJsonArray(jsonArray, new StringKeyComparator(key));
    }

    public static List<JSONObject> getSortedListFromJSONArray(JSONArray jsonArray, Comparator comparator) {
        return getListFromJSONArray(sortJsonArray(jsonArray, comparator));
    }

    public static List<JSONObject> getSortedListFromJSONArray(JSONArray jsonArray, String key) {
        return getSortedListFromJSONArray(jsonArray, new StringKeyComparator(key));
    }

    public static JSONArray getJSONArrayFromList(List<JSONObject> jsonObjectList) {
        JSONArray jsonArray = new JSONArray();

        for (int i = 0; i < jsonObjectList.size(); i++) {
            jsonArray.put(jsonObjectList.get(i));
        }

        return jsonArray;
    }

    public static List<JSONObject> getListFromJSONArray(JSONArray jsonArray) {
        List<JSONObject> jsonValues = new ArrayList<>();

        for (int i = 0; i < jsonArray.length(); i++) {
            jsonValues.add(jsonArray.getJSONObject(i));
        }

        return jsonValues;
    }
}
