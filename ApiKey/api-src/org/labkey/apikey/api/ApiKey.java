package org.labkey.apikey.api;

import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

/**
 * Created by jon on 11/15/16.
 */
public interface ApiKey {
    String getKey();
    User getUser();
    LocalDateTime getExpirationDate();
    Map<Module, Set<JsonService>> getAllowedServices();
    boolean isSuperKey();

    boolean isValid();
}
