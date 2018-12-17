package org.labkey.apikey.service;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.apikey.api.ApiKey;
import org.labkey.apikey.api.ApiKeyService;
import org.labkey.apikey.model.ApiKeyImpl;
import org.labkey.apikey.model.jOOQConnection;
import org.labkey.apikey.model.jooq.tables.records.AllowedServicesRecord;
import org.labkey.apikey.model.jooq.tables.records.ApikeysRecord;
import org.labkey.apikey.model.jooq.tables.records.KeyRevocationsRecord;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.TemporalUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.labkey.apikey.model.jooq.Apikey.APIKEY;

/**
 * Created by jon on 11/15/16.
 */
public class ApiKeyServiceImpl extends ApiKeyService {
    // This is expensive to instantiate (http://stackoverflow.com/questions/41107/how-to-generate-a-random-alpha-numeric-string),
    // so only instantiate it once.
    private SecureRandom random = new SecureRandom();

    @Nullable
    @Override
    public ApiKey loadKey(String key) {
        ApiKey apiKey = null;

        try (jOOQConnection conn = new jOOQConnection()) {
            ApikeysRecord apikeyRecord = conn.create().fetchOne(APIKEY.APIKEYS, APIKEY.APIKEYS.APIKEY.eq(key));

            if (apikeyRecord == null) {
                return null;
            }

            ApiKeyImpl newKey = new ApiKeyImpl(
                    key,
                    apikeyRecord.getOwner(),
                    apikeyRecord.getStarts(),
                    apikeyRecord.getExpires(),
                    apikeyRecord.getIssuperkey()
            );

            for (AllowedServicesRecord service : conn.create().fetch(APIKEY.ALLOWED_SERVICES, APIKEY.ALLOWED_SERVICES.APIKEY.equal(key))) {
                Module module = ModuleLoader.getInstance().getModule(service.getModulename());

                newKey.addService(module, service.getServicename());
            }

            apiKey = newKey;
        }

        return apiKey;
    }

    @Override
    public ApiKey generateKey(User user, @Nullable Map<Module, Set<String>> serviceNames, @Nullable Duration expirationTime, @Nullable String note) {
        // Generate a random key
        String key = new BigInteger(260, random).toString(32);

        try(jOOQConnection conn = new jOOQConnection()) {
            // Create a new record for this apikey
            ApikeysRecord apikeyRecord = conn.create().newRecord(APIKEY.APIKEYS);

            // Set apikey, owner, and note
            apikeyRecord.setApikey(key);
            apikeyRecord.setOwner(user.getUserId());
            apikeyRecord.setNote(note);

            // Set the start time
            LocalDateTime now = LocalDateTime.now();
            apikeyRecord.setStarts(Timestamp.valueOf(now));

            // Set the expiration
            expirationTime = (expirationTime == null) ? Duration.ofHours(1) : expirationTime;
            LocalDateTime expireDate = now.plus(expirationTime);
            apikeyRecord.setExpires(Timestamp.valueOf(expireDate));

            // Now, set the service names
            List<AllowedServicesRecord> allowedServices = new ArrayList<>();
            if (serviceNames == null) {
                apikeyRecord.setIssuperkey(true);
            }
            else {
                for(Module module : serviceNames.keySet()) {
                    for(String serviceName : serviceNames.get(module)) {
                        AllowedServicesRecord rec = conn.create().newRecord(APIKEY.ALLOWED_SERVICES);

                        rec.setApikey(key);
                        rec.setModulename(module.getName());
                        rec.setServicename(serviceName);

                        allowedServices.add(rec);
                    }
                }
            }

            apikeyRecord.store();
            conn.create().batchInsert(allowedServices);
        }

        return this.loadKey(key);
    }

    @Override
    public void revokeApiKey(ApiKey key, User revokingUser, String comment) {
        try(jOOQConnection conn = new jOOQConnection()) {
            KeyRevocationsRecord rec = conn.create().newRecord(APIKEY.KEY_REVOCATIONS);

            rec.setApikey(key.getKey());
            rec.setRevokedon(Timestamp.valueOf(LocalDateTime.now()));
            rec.setRevokedby(revokingUser.getUserId());
            rec.setReason(comment);

            rec.store();
        }
    }
}
