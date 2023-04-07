package org.labkey.apikey.api;

import org.json.old.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;

/**
 * Created by jon on 11/15/16.
 */
public interface JsonService {
    JSONObject execute(User user, Container container, JSONObject input);
    String getName();
}
