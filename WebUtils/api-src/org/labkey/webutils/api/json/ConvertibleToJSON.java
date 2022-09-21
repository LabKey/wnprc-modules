package org.labkey.webutils.api.json;

import org.json.old.JSONObject;

/**
 * Created by jon on 9/16/16.
 */
public interface ConvertibleToJSON
{
    JSONObject toJSON();
}
