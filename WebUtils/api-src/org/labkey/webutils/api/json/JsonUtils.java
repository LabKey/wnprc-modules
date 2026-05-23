/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.webutils.api.json;

import org.json.JSONArray;
import org.json.JSONObject;

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

        jsonList.sort(comparator);

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

        for (JSONObject jsonObject : jsonObjectList)
        {
            jsonArray.put(jsonObject);
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
