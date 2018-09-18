package org.labkey.apikey.model;

import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.apikey.api.ApiKey;
import org.labkey.apikey.api.JsonService;
import org.labkey.apikey.api.JsonServiceManager;
import org.labkey.apikey.model.jooq.tables.records.KeyRevocationsRecord;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static org.labkey.apikey.model.jooq.Apikey.APIKEY;

/**
 * Created by jon on 11/15/16.
 */
public class ApiKeyImpl implements ApiKey {
    private final String key;
    private final User user;
    private final LocalDateTime startDateTime;
    private final LocalDateTime expirationDate;
    private final boolean isSuperKey;

    private final Map<Module, Set<JsonService>> services = new HashMap<>();

    public ApiKeyImpl(String key, int userid, Timestamp startDateTime, Timestamp expirationDate, boolean isSuperKey) {
        this.key = key;
        this.user = UserManager.getUser(userid);
        this.startDateTime = startDateTime.toLocalDateTime();
        this.expirationDate = expirationDate.toLocalDateTime();
        this.isSuperKey = isSuperKey;
    }

    @Override
    public String getKey() {
        return this.key;
    }

    @Override
    public User getUser() {
        return this.user;
    }

    @Override
    public LocalDateTime getExpirationDate() {
        return this.expirationDate;
    }

    @Override
    public Map<Module, Set<JsonService>> getAllowedServices() {
        return this.services;
    }

    @Override
    public boolean isSuperKey() {
        return this.isSuperKey;
    }

    @Override
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();

        // Make sure we're not expired
        if (expirationDate != null && now.isAfter(this.getExpirationDate())) {
            return false;
        }

        // Make sure we've started being valid
        if (startDateTime != null && now.isBefore(this.startDateTime)) {
            return false;
        }

        // Make sure we haven't been revoked.
        try(jOOQConnection conn = new jOOQConnection()) {
            KeyRevocationsRecord rec = conn.create().fetchOne(APIKEY.KEY_REVOCATIONS, APIKEY.KEY_REVOCATIONS.APIKEY.eq(key));

            if (rec != null && now.isAfter(rec.getRevokedon().toLocalDateTime())) {
                return false;
            }
        }

        return true;
    }

    public void addService(Module module, String serviceName) {
        if (!services.containsKey(module)) {
            services.put(module, new HashSet<JsonService>());
        }

        JsonService service = JsonServiceManager.get().getService(module, serviceName);

        if (service != null) {
            services.get(module).add(service);
        }
    }
}
