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

import org.jetbrains.annotations.Nullable;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.time.Duration;
import java.util.Map;
import java.util.Set;

/**
 * Created by jon on 11/15/16.
 */
public abstract class ApiKeyService {
    static private ApiKeyService service;

    static public void set(ApiKeyService service) {
        ApiKeyService.service = service;
    }

    static public ApiKeyService get() {
        return service;
    }

    @Nullable
    abstract public ApiKey loadKey(String key);

    abstract public ApiKey generateKey(User user, @Nullable Map<Module, Set<String>> serviceNames, @Nullable Duration expirationTime, @Nullable String note);
    abstract public void revokeApiKey(ApiKey key, User revokingUser, String comment);
}
