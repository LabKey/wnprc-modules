package org.labkey.apikey.service;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.security.User;
import org.labkey.apikey.api.ApiKey;
import org.labkey.apikey.api.ApiKeyService;

import java.time.Duration;
import java.util.Set;

/**
 * Created by jon on 11/15/16.
 */
public class ApiKeyServiceImpl extends ApiKeyService {
    @Nullable
    @Override
    public ApiKey loadKey(String key) {
        return null;
    }

    @Override
    public ApiKey generateKey(User user, @Nullable Set<String> serviceNames, @Nullable Duration expirationTime) {
        return null;
    }

    @Override
    public void revokeApiKey(ApiKey key, User revokingUser, String comment) {

    }
}
