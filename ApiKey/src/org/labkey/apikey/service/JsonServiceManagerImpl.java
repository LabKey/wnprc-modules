package org.labkey.apikey.service;

import org.apache.commons.collections15.map.CaseInsensitiveMap;
import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.apikey.api.ApiKey;
import org.labkey.apikey.api.ApiKeyService;
import org.labkey.apikey.api.JsonService;
import org.labkey.apikey.api.JsonServiceManager;
import org.labkey.apikey.api.exception.InvalidApiKey;
import org.labkey.apikey.api.exception.ServiceDoesNotExist;
import org.labkey.apikey.api.exception.ServiceNotAllowed;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Created by jon on 11/15/16.
 */
public class JsonServiceManagerImpl extends JsonServiceManager {
    private Map<Module, CaseInsensitiveMap<JsonService>> moduleMap = new HashMap<>();

    public JsonServiceManagerImpl() {}

    private CaseInsensitiveMap<JsonService> getServiceMap(Module module) {
        if (!moduleMap.containsKey(module)) {
            CaseInsensitiveMap<JsonService> serviceMap = new CaseInsensitiveMap<>();
            moduleMap.put(module, serviceMap);
        }

        return moduleMap.get(module);
    }

    @Override
    public void registerService(Module module, JsonService service) {
        getServiceMap(module).put(service.getName(), service);
    }

    @Override
    public CaseInsensitiveMap<JsonService> getServices(Module module) {
        return getServiceMap(module);
    }

    @Nullable
    @Override
    public JsonService getService(Module module, String name) {
        return null;
    }

    @Override
    public JSONObject executeService(Module module, Container container, String name, String apiKey, JSONObject input) throws ServiceDoesNotExist, InvalidApiKey, ServiceNotAllowed {
        JsonService service = getServiceMap(module).get(name);

        if (service == null) {
            throw new ServiceDoesNotExist(String.format(
                    "No service named '%s' is registered for the %s module.",
                    name,
                    module.getName()
            ));
        }

        ApiKey trueKey = ApiKeyService.get().loadKey(apiKey);

        if (trueKey == null) {
            throw new InvalidApiKey("Invalid ApiKey");
        }

        if (!trueKey.isSuperKey()) {
            Set<JsonService> allowedServices = trueKey.getAllowedServices().get(module);

            if (allowedServices == null || !allowedServices.contains(service)) {
                throw new ServiceNotAllowed("This ApiKey does not have permission to execute this service");
            }
        }

        return service.execute(trueKey.getUser(), container, (input == null) ? new JSONObject() : input);
    }
}
