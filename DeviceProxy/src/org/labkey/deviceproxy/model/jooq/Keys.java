/**
 * This class is generated by jOOQ
 */
package org.labkey.deviceproxy.model.jooq;


import jakarta.annotation.Generated;

import org.jooq.ForeignKey;
import org.jooq.UniqueKey;
import org.jooq.impl.AbstractKeys;
import org.labkey.deviceproxy.model.jooq.tables.AllowedService;
import org.labkey.deviceproxy.model.jooq.tables.AuthMethod;
import org.labkey.deviceproxy.model.jooq.tables.Device;
import org.labkey.deviceproxy.model.jooq.tables.Lease;
import org.labkey.deviceproxy.model.jooq.tables.Users;
import org.labkey.deviceproxy.model.jooq.tables.records.AllowedServiceRecord;
import org.labkey.deviceproxy.model.jooq.tables.records.AuthMethodRecord;
import org.labkey.deviceproxy.model.jooq.tables.records.DeviceRecord;
import org.labkey.deviceproxy.model.jooq.tables.records.LeaseRecord;
import org.labkey.deviceproxy.model.jooq.tables.records.UsersRecord;


/**
 * A class modelling foreign key relationships between tables of the <code>deviceproxy</code> 
 * schema
 */
@Generated(
    value = {
        "http://www.jooq.org",
        "jOOQ version:3.8.4"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Keys {

    // -------------------------------------------------------------------------
    // IDENTITY definitions
    // -------------------------------------------------------------------------


    // -------------------------------------------------------------------------
    // UNIQUE and PRIMARY KEY definitions
    // -------------------------------------------------------------------------

    public static final UniqueKey<AllowedServiceRecord> PK_ALLOWED_SERVICE = UniqueKeys0.PK_ALLOWED_SERVICE;
    public static final UniqueKey<AuthMethodRecord> PK_AUTH_METHOD = UniqueKeys0.PK_AUTH_METHOD;
    public static final UniqueKey<DeviceRecord> PK_DEVICE_REQUEST = UniqueKeys0.PK_DEVICE_REQUEST;
    public static final UniqueKey<LeaseRecord> PK_LEASE = UniqueKeys0.PK_LEASE;
    public static final UniqueKey<UsersRecord> PK_USERS = UniqueKeys0.PK_USERS;
    public static final UniqueKey<UsersRecord> USERS_CARDNUMBER_UNIQUE = UniqueKeys0.USERS_CARDNUMBER_UNIQUE;

    // -------------------------------------------------------------------------
    // FOREIGN KEY definitions
    // -------------------------------------------------------------------------

    public static final ForeignKey<AllowedServiceRecord, LeaseRecord> ALLOWED_SERVICE__FK_ALLOWED_SERVICE_LEASE = ForeignKeys0.ALLOWED_SERVICE__FK_ALLOWED_SERVICE_LEASE;
    public static final ForeignKey<AuthMethodRecord, LeaseRecord> AUTH_METHOD__FK_AUTH_METHOD_LEASE = ForeignKeys0.AUTH_METHOD__FK_AUTH_METHOD_LEASE;
    public static final ForeignKey<LeaseRecord, DeviceRecord> LEASE__FK_LEASE_DEVICE = ForeignKeys0.LEASE__FK_LEASE_DEVICE;

    // -------------------------------------------------------------------------
    // [#1459] distribute members to avoid static initialisers > 64kb
    // -------------------------------------------------------------------------

    private static class UniqueKeys0 extends AbstractKeys {
        public static final UniqueKey<AllowedServiceRecord> PK_ALLOWED_SERVICE = createUniqueKey(AllowedService.ALLOWED_SERVICE, "pk_allowed_service", AllowedService.ALLOWED_SERVICE.PUBLIC_KEY, AllowedService.ALLOWED_SERVICE.START_TIME, AllowedService.ALLOWED_SERVICE.MODULE_NAME, AllowedService.ALLOWED_SERVICE.SERVICE_NAME);
        public static final UniqueKey<AuthMethodRecord> PK_AUTH_METHOD = createUniqueKey(AuthMethod.AUTH_METHOD, "pk_auth_method", AuthMethod.AUTH_METHOD.PUBLIC_KEY, AuthMethod.AUTH_METHOD.START_TIME, AuthMethod.AUTH_METHOD.AUTH_METHOD_);
        public static final UniqueKey<DeviceRecord> PK_DEVICE_REQUEST = createUniqueKey(Device.DEVICE, "pk_device_request", Device.DEVICE.PUBLIC_KEY);
        public static final UniqueKey<LeaseRecord> PK_LEASE = createUniqueKey(Lease.LEASE, "pk_lease", Lease.LEASE.PUBLIC_KEY, Lease.LEASE.START_TIME);
        public static final UniqueKey<UsersRecord> PK_USERS = createUniqueKey(Users.USERS, "pk_users", Users.USERS.USERID);
        public static final UniqueKey<UsersRecord> USERS_CARDNUMBER_UNIQUE = createUniqueKey(Users.USERS, "users_cardnumber_unique", Users.USERS.CARD_NUMBER);
    }

    private static class ForeignKeys0 extends AbstractKeys {
        public static final ForeignKey<AllowedServiceRecord, LeaseRecord> ALLOWED_SERVICE__FK_ALLOWED_SERVICE_LEASE = createForeignKey(org.labkey.deviceproxy.model.jooq.Keys.PK_LEASE, AllowedService.ALLOWED_SERVICE, "allowed_service__fk_allowed_service_lease", AllowedService.ALLOWED_SERVICE.PUBLIC_KEY, AllowedService.ALLOWED_SERVICE.START_TIME);
        public static final ForeignKey<AuthMethodRecord, LeaseRecord> AUTH_METHOD__FK_AUTH_METHOD_LEASE = createForeignKey(org.labkey.deviceproxy.model.jooq.Keys.PK_LEASE, AuthMethod.AUTH_METHOD, "auth_method__fk_auth_method_lease", AuthMethod.AUTH_METHOD.PUBLIC_KEY, AuthMethod.AUTH_METHOD.START_TIME);
        public static final ForeignKey<LeaseRecord, DeviceRecord> LEASE__FK_LEASE_DEVICE = createForeignKey(org.labkey.deviceproxy.model.jooq.Keys.PK_DEVICE_REQUEST, Lease.LEASE, "lease__fk_lease_device", Lease.LEASE.PUBLIC_KEY);
    }
}
