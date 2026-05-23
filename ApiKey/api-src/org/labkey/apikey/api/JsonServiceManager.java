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
package org.labkey.apikey.api;

import org.apache.commons.collections4.map.CaseInsensitiveMap;
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
    abstract public CaseInsensitiveMap<String, JsonService> getServices(Module module);

    @Nullable
    abstract public JsonService getService(Module module, String name);

    abstract public JSONObject executeService(Module module, Container container, String name, String apiKey, JSONObject input) throws ServiceDoesNotExist, ServiceNotAllowed, InvalidApiKey;
}
