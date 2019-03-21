package org.labkey.deviceproxy.service;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.apikey.api.ApiKey;
import org.labkey.apikey.api.ApiKeyService;
import org.labkey.deviceproxy.model.jooq.jOOQConnection;
import org.labkey.deviceproxy.model.jooq.tables.records.AllowedServiceRecord;
import org.labkey.deviceproxy.model.jooq.tables.records.AuthMethodRecord;
import org.labkey.deviceproxy.model.jooq.tables.records.DeviceRecord;
import org.labkey.deviceproxy.model.jooq.tables.records.LeaseRecord;
import org.labkey.deviceproxy.model.jooq.tables.records.UsersRecord;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

import static org.labkey.deviceproxy.model.jooq.Deviceproxy.DEVICEPROXY;

/**
 * Created by jon on 11/16/16.
 */
public class DeviceProxyService {
    public static DeviceProxyService service = new DeviceProxyService();

    public static DeviceProxyService get() {
        return service;
    }

    public DeviceProxyService() {}

    public void requestLease(String publicKey, String name, String description) {
        try(jOOQConnection conn = new jOOQConnection()) {
            DeviceRecord device = conn.create().newRecord(DEVICEPROXY.DEVICE);

            device.setPublicKey(publicKey);
            device.setName(name);
            device.setDescription(description);

            device.store();
        }
    }

    public void approveLease(String publicKey, User approvedBy) {
        try(jOOQConnection conn = new jOOQConnection()) {
            LeaseRecord lease = conn.create().newRecord(DEVICEPROXY.LEASE);

            lease.setPublicKey(publicKey);
            lease.setStartTime(Timestamp.valueOf(LocalDateTime.now()));

            lease.setCreatedby(approvedBy.getUserId());

            lease.store();
        }
    }

    public void revokeLease(String publicKey, LocalDateTime startTime, User revokedBy) {
        Timestamp startTimestamp = Timestamp.valueOf(startTime);

        try(jOOQConnection conn = new jOOQConnection()) {
            LeaseRecord lease = conn.create().fetchOne(DEVICEPROXY.LEASE, DEVICEPROXY.LEASE.PUBLIC_KEY.eq(publicKey).and(DEVICEPROXY.LEASE.START_TIME.eq(startTimestamp)));

            if (lease != null) {
                lease.setEndedby(revokedBy.getUserId());
                lease.setEndedon(Timestamp.valueOf(LocalDateTime.now()));
                lease.setEndTime(Timestamp.valueOf(LocalDateTime.now()));

                lease.store();
            }
        }
    }

    public void addAuthOption(String publicKey, LocalDateTime startTime, String authName) {
        try(jOOQConnection conn = new jOOQConnection()) {
            AuthMethodRecord record = conn.create().newRecord(DEVICEPROXY.AUTH_METHOD);

            record.setPublicKey(publicKey);
            record.setStartTime(Timestamp.valueOf(startTime));
            record.setAuthMethod(authName);

            record.store();
        }
    }

    public void addService(String publicKey, LocalDateTime startTime, String moduleName, String serviceName) {
        try(jOOQConnection conn = new jOOQConnection()) {
            AllowedServiceRecord record = conn.create().newRecord(DEVICEPROXY.ALLOWED_SERVICE);

            record.setPublicKey(publicKey);
            record.setStartTime(Timestamp.valueOf(startTime));
            record.setModuleName(moduleName);
            record.setServiceName(serviceName);

            record.store();
        }
    }

    private static String hashPin(@NotNull String pin) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");

            md.update(pin.getBytes("UTF-8"));
            byte[] digest = md.digest();

            return String.format("%064x", new java.math.BigInteger(1, digest));
        }
        catch (NoSuchAlgorithmException|UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    public void enroll(User user, String cardNumber, String pin) {
        try (jOOQConnection conn = new jOOQConnection()) {
            UsersRecord usersRecord = conn.create().fetchOne(DEVICEPROXY.USERS, DEVICEPROXY.USERS.USERID.eq(user.getUserId()));

            if (usersRecord == null) {
                usersRecord = conn.create().newRecord(DEVICEPROXY.USERS);

                usersRecord.setUserid(user.getUserId());
            }

            usersRecord.setCardNumber(cardNumber);
            usersRecord.setPinHash(hashPin(pin));

            usersRecord.store();
        }
    }

    public ApiKey requestApiKey(String publicKey, String cardNumber, String pin) {
        LocalDateTime now = LocalDateTime.now();

        try(jOOQConnection conn = new jOOQConnection()) {
            DeviceRecord device = conn.create().fetchOne(DEVICEPROXY.DEVICE, DEVICEPROXY.DEVICE.PUBLIC_KEY.eq(publicKey));
            if (device == null) {
                return null;
            }

            boolean hasValidLease = false;
            for(LeaseRecord leaseRecord : conn.create().fetch(DEVICEPROXY.LEASE, DEVICEPROXY.LEASE.PUBLIC_KEY.eq(publicKey))) {
                if (now.isAfter(leaseRecord.getStartTime().toLocalDateTime())
                        && (leaseRecord.getEndTime() == null || now.isBefore(leaseRecord.getEndTime().toLocalDateTime()))) {
                    hasValidLease = true;
                }
            }

            if (!hasValidLease) {
                return null;
            }

            UsersRecord record = conn.create().fetchOne(DEVICEPROXY.USERS, DEVICEPROXY.USERS.CARD_NUMBER.eq(cardNumber));

            if (record == null) {
                return null;
            }

            String hashedPin = hashPin(pin);
            if (!record.getPinHash().equals(hashedPin)) {
                return null;
            }

            User user = UserManager.getUser(record.getUserid());

            if (user == null) {
                return null;
            }

            return ApiKeyService.get().generateKey(user, null, null, null);
        }
    }
}
