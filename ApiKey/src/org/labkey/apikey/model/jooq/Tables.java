/**
 * This class is generated by jOOQ
 */
package org.labkey.apikey.model.jooq;


import jakarta.annotation.Generated;
import org.labkey.apikey.model.jooq.tables.AllowedServices;
import org.labkey.apikey.model.jooq.tables.Apikeys;
import org.labkey.apikey.model.jooq.tables.KeyRevocations;


/**
 * Convenience access to all tables in apikey
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
     * The table <code>apikey.allowed_services</code>.
     */
    public static final AllowedServices ALLOWED_SERVICES = org.labkey.apikey.model.jooq.tables.AllowedServices.ALLOWED_SERVICES;

    /**
     * The table <code>apikey.apikeys</code>.
     */
    public static final Apikeys APIKEYS = org.labkey.apikey.model.jooq.tables.Apikeys.APIKEYS;

    /**
     * The table <code>apikey.key_revocations</code>.
     */
    public static final KeyRevocations KEY_REVOCATIONS = org.labkey.apikey.model.jooq.tables.KeyRevocations.KEY_REVOCATIONS;
}
