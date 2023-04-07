package org.labkey.apikey.api;

import org.json.old.JSONObject;

/**
 * Created by jon on 11/15/16.
 */
public interface ApiKeyProvider {
    ApiKeyForm validate(JSONObject object);
}
