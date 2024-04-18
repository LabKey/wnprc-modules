/**
 * This class is generated by jOOQ
 */
package org.labkey.deviceproxy.model.jooq;


import jakarta.annotation.Generated;
import org.labkey.deviceproxy.model.jooq.tables.AllowedService;
import org.labkey.deviceproxy.model.jooq.tables.AuthMethod;
import org.labkey.deviceproxy.model.jooq.tables.Device;
import org.labkey.deviceproxy.model.jooq.tables.Lease;
import org.labkey.deviceproxy.model.jooq.tables.Users;


/**
 * Convenience access to all tables in deviceproxy
 */
@Generated(
    value = {
        "http://www.jooq.org",
        "jOOQ version:3.8.4"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Tables {

    /**
     * The table <code>deviceproxy.allowed_service</code>.
     */
    public static final AllowedService ALLOWED_SERVICE = org.labkey.deviceproxy.model.jooq.tables.AllowedService.ALLOWED_SERVICE;

    /**
     * The table <code>deviceproxy.auth_method</code>.
     */
    public static final AuthMethod AUTH_METHOD = org.labkey.deviceproxy.model.jooq.tables.AuthMethod.AUTH_METHOD;

    /**
     * The table <code>deviceproxy.device</code>.
     */
    public static final Device DEVICE = org.labkey.deviceproxy.model.jooq.tables.Device.DEVICE;

    /**
     * The table <code>deviceproxy.lease</code>.
     */
    public static final Lease LEASE = org.labkey.deviceproxy.model.jooq.tables.Lease.LEASE;

    /**
     * The table <code>deviceproxy.users</code>.
     */
    public static final Users USERS = org.labkey.deviceproxy.model.jooq.tables.Users.USERS;
}
