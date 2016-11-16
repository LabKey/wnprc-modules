package org.labkey.apikey.api;

import org.apache.commons.collections15.map.CaseInsensitiveMap;
import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.apikey.api.exception.InvalidApiKey;
import org.labkey.apikey.api.exception.ServiceDoesNotExist;
import org.labkey.apikey.api.exception.ServiceNotAllowed;

/**
 * Created by jon on 11/15/16.
 */
public abstract class JsonServiceManager {
    static private JsonServiceManager serviceManager;

    static public void set(JsonServiceManager jsonServiceManager) {
        JsonServiceManager.serviceManager = jsonServiceManager;
    }

    static public JsonServiceManager get() {
        return serviceManager;
    }

    abstract public void registerService(Module module, JsonService service);
    abstract public CaseInsensitiveMap<JsonService> getServices(Module module);

    @Nullable
    abstract public JsonService getService(Module module, String name);

    abstract public JSONObject executeService(Module module, Container container, String name, String apiKey, JSONObject input) throws ServiceDoesNotExist, ServiceNotAllowed, InvalidApiKey;
}
