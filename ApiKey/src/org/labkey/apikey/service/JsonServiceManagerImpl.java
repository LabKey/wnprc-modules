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
package org.labkey.apikey.service;

import org.apache.commons.collections4.map.CaseInsensitiveMap;
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
    private final Map<Module, CaseInsensitiveMap<String, JsonService>> moduleMap = new HashMap<>();

    public JsonServiceManagerImpl() {}

    private CaseInsensitiveMap<String, JsonService> getServiceMap(Module module) {
        if (!moduleMap.containsKey(module)) {
            CaseInsensitiveMap<String, JsonService> serviceMap = new CaseInsensitiveMap<>();
            moduleMap.put(module, serviceMap);
        }

        return moduleMap.get(module);
    }

    @Override
    public void registerService(Module module, JsonService service) {
        getServiceMap(module).put(service.getName(), service);
    }

    @Override
    public CaseInsensitiveMap<String, JsonService> getServices(Module module) {
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
