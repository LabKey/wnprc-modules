package org.labkey.webutils.api.json;

import org.json.old.JSONArray;
import org.json.old.JSONObject;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiResponseWriter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A wrapper for ApiResponse and JSONObject that allows objects to better control how they are
 * serialized by implementing the ConvertibleToJSON interface.
 *
 * Created by jon on 2/23/16.
 */
public class EnhancedJsonResponse extends JSONObject implements ApiResponse, Map<String, Object> {
    public EnhancedJsonResponse() {}

    public EnhancedJsonResponse(JSONObject json) {
        this.setData(json);
    }

    @Override
    public void render(ApiResponseWriter writer) throws Exception {
        Object responseObject = parseJsonObject(this);

        if (responseObject instanceof Map) {
            writer.writeResponse(responseObject);
        }
        else {
            // Since "this" is a JSONObject, there really should be no way for parseJsonObject to return anything
            // other than a map.  In other words, this following line should never execute.
            throw new Exception("Root object for this object needs to be a JSONObject or map.");
        }
    }

    private static Object parseJsonObject(Object object) {
        // Check if this object can be turned into a json object, and, if so, do it.
        if (object instanceof ConvertibleToJSON) {
            object = ((ConvertibleToJSON) object).toJSON();
        }

        if (object == null) {
            return null;
        }
        else if (object instanceof JSONObject) {
            JSONObject jsonObject = (JSONObject) object;
            Map<String, Object> map = new HashMap<>();

            // Iterate over keys, and recursively call this method.
            for( String key: jsonObject.keySet() ) {
                Object value = jsonObject.get(key);
                map.put(key, parseJsonObject(value));
            }

            return map;
        }
        else if (object instanceof JSONArray) {
            List<Object> list = new ArrayList<>();
            JSONArray jsonArray = (JSONArray) object;

            for( Object value : jsonArray.toArray()) {
                list.add(parseJsonObject(value));
            }

            return list;
        }
        else {
            return object.toString();
        }
    }

    public void setData(JSONObject json) {
        for( String key : json.keySet() ) {
            this.put(key, json.get(key));
        }
    }
}

