/**
 * This class is generated by jOOQ
 */
package org.labkey.apikey.model.jooq;


import jakarta.annotation.Generated;

import org.jooq.UniqueKey;
import org.jooq.impl.AbstractKeys;
import org.labkey.apikey.model.jooq.tables.AllowedServices;
import org.labkey.apikey.model.jooq.tables.Apikeys;
import org.labkey.apikey.model.jooq.tables.KeyRevocations;
import org.labkey.apikey.model.jooq.tables.records.AllowedServicesRecord;
import org.labkey.apikey.model.jooq.tables.records.ApikeysRecord;
import org.labkey.apikey.model.jooq.tables.records.KeyRevocationsRecord;


/**
 * A class modelling foreign key relationships between tables of the <code>apikey</code> 
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

    public static final UniqueKey<AllowedServicesRecord> PK_SERVICES = UniqueKeys0.PK_SERVICES;
    public static final UniqueKey<ApikeysRecord> PK_APIKEYS = UniqueKeys0.PK_APIKEYS;
    public static final UniqueKey<KeyRevocationsRecord> PK_KEY_REVOCATIONS = UniqueKeys0.PK_KEY_REVOCATIONS;

    // -------------------------------------------------------------------------
    // FOREIGN KEY definitions
    // -------------------------------------------------------------------------


    // -------------------------------------------------------------------------
    // [#1459] distribute members to avoid static initialisers > 64kb
    // -------------------------------------------------------------------------

    private static class UniqueKeys0 extends AbstractKeys {
        public static final UniqueKey<AllowedServicesRecord> PK_SERVICES = createUniqueKey(AllowedServices.ALLOWED_SERVICES, "pk_services", AllowedServices.ALLOWED_SERVICES.APIKEY, AllowedServices.ALLOWED_SERVICES.MODULENAME, AllowedServices.ALLOWED_SERVICES.SERVICENAME);
        public static final UniqueKey<ApikeysRecord> PK_APIKEYS = createUniqueKey(Apikeys.APIKEYS, "pk_apikeys", Apikeys.APIKEYS.APIKEY);
        public static final UniqueKey<KeyRevocationsRecord> PK_KEY_REVOCATIONS = createUniqueKey(KeyRevocations.KEY_REVOCATIONS, "pk_key_revocations", KeyRevocations.KEY_REVOCATIONS.APIKEY);
    }
}
