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

import org.json.JSONObject;

import java.util.Comparator;

/**
 * Created by jon on 4/15/16.
 */
public class StringKeyComparator implements Comparator<JSONObject> {
    private final String key;

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
        }
        else if (!b.has(key) || b.isNull(key)) {
            return -1;
        }

        String valA = a.optString(key, "");
        String valB = b.optString(key, "");

        return valA.compareTo(valB);
        //if you want to change the sort order, simply use the following:
        //return -valA.compareTo(valB);
    }
}
