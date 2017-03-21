package org.labkey.wnprc_compliance.protocol;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.dbutils.jooq.jOOQConnection;
import org.labkey.wnprc_compliance.WNPRC_ComplianceSchema;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolsRecord;

import java.util.UUID;

import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOLS;

/**
 * Created by jon on 3/21/17.
 */
public class ProtocolService {
    public static void createNewProtocol(String code, User user, Container container) {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME)) {
            ProtocolsRecord record = conn.create().newRecord(PROTOCOLS);
            record.setId(UUID.randomUUID().toString().toUpperCase());
            record.setProtocolNumber("g1000");
            record.setContainer(container.getId());
            record.store();
        }
    }
}
