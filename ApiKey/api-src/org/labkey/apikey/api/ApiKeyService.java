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
