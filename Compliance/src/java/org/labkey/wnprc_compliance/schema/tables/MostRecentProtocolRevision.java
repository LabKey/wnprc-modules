package org.labkey.wnprc_compliance.schema.tables;

import org.jetbrains.annotations.Nullable;
import org.jooq.*;
import org.labkey.api.query.UserSchema;
import org.labkey.dbutils.jooq.jOOQConnection;
import org.labkey.dbutils.jooq.jOOQTableInfo;
import org.labkey.wnprc_compliance.WNPRC_ComplianceSchema;

import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOLS;
import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOL_REVISIONS;

/**
 * Created by jon on 3/27/17.
 */
public class MostRecentProtocolRevision extends jOOQTableInfo {
    public static String NAME = "MostRecentProtocolRevision";

    public MostRecentProtocolRevision(@Nullable UserSchema userSchema) {
        super(NAME, WNPRC_ComplianceSchema.NAME, userSchema);
    }

    @Override
    public Table<? extends Record> getjOOQTable() {
        try (jOOQConnection jOOQConnection = new jOOQConnection(WNPRC_ComplianceSchema.NAME)) {
            return jOOQConnection.create().select(PROTOCOL_REVISIONS.PROTOCOL_ID, PROTOCOL_REVISIONS.APPROVAL_DATE, PROTOCOL_REVISIONS.HAS_PHYSICAL_HAZARDS)
                    .from(PROTOCOL_REVISIONS)
                    .asTable();
        }
    }
}
