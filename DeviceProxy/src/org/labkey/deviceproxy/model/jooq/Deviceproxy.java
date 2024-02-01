/**
 * This class is generated by jOOQ
 */
package org.labkey.deviceproxy.model.jooq;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import jakarta.annotation.Generated;

import org.jooq.Catalog;
import org.jooq.Table;
import org.jooq.impl.SchemaImpl;
import org.labkey.deviceproxy.model.jooq.tables.AllowedService;
import org.labkey.deviceproxy.model.jooq.tables.AuthMethod;
import org.labkey.deviceproxy.model.jooq.tables.Device;
import org.labkey.deviceproxy.model.jooq.tables.Lease;
import org.labkey.deviceproxy.model.jooq.tables.Users;


/**
 * This class is generated by jOOQ.
 */
@Generated(
    value = {
        "http://www.jooq.org",
        "jOOQ version:3.8.4"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Deviceproxy extends SchemaImpl {

    private static final long serialVersionUID = -2002638633;

    /**
     * The reference instance of <code>deviceproxy</code>
     */
    public static final Deviceproxy DEVICEPROXY = new Deviceproxy();

    /**
     * The table <code>deviceproxy.allowed_service</code>.
     */
    public final AllowedService ALLOWED_SERVICE = org.labkey.deviceproxy.model.jooq.tables.AllowedService.ALLOWED_SERVICE;

    /**
     * The table <code>deviceproxy.auth_method</code>.
     */
    public final AuthMethod AUTH_METHOD = org.labkey.deviceproxy.model.jooq.tables.AuthMethod.AUTH_METHOD;

    /**
     * The table <code>deviceproxy.device</code>.
     */
    public final Device DEVICE = org.labkey.deviceproxy.model.jooq.tables.Device.DEVICE;

    /**
     * The table <code>deviceproxy.lease</code>.
     */
    public final Lease LEASE = org.labkey.deviceproxy.model.jooq.tables.Lease.LEASE;

    /**
     * The table <code>deviceproxy.users</code>.
     */
    public final Users USERS = org.labkey.deviceproxy.model.jooq.tables.Users.USERS;

    /**
     * No further instances allowed
     */
    private Deviceproxy() {
        super("deviceproxy", null);
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public Catalog getCatalog() {
        return DefaultCatalog.DEFAULT_CATALOG;
    }

    @Override
    public final List<Table<?>> getTables() {
        List result = new ArrayList();
        result.addAll(getTables0());
        return result;
    }

    private final List<Table<?>> getTables0() {
        return Arrays.<Table<?>>asList(
            AllowedService.ALLOWED_SERVICE,
            AuthMethod.AUTH_METHOD,
            Device.DEVICE,
            Lease.LEASE,
            Users.USERS);
    }
}
