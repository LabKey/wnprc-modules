package org.labkey.wnprc_compliance.schema.tables;

import org.jetbrains.annotations.Nullable;
import org.jooq.*;
import org.labkey.api.query.UserSchema;
import org.labkey.dbutils.jooq.jOOQConnection;
import org.labkey.dbutils.jooq.jOOQTableInfo;
import org.labkey.wnprc_compliance.WNPRC_ComplianceSchema;

import java.sql.Timestamp;

import static org.jooq.impl.DSL.max;
import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOLS;
import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOL_REVISIONS;

/**
 * Created by jon on 3/27/17.
 */
public class MostRecentProtocolRevision extends jOOQTableInfo {
    public static String NAME = "mostRecentProtocolRevision";

    public Field<String> ID_FIELD;

    public MostRecentProtocolRevision(@Nullable UserSchema userSchema) {
        super(NAME, WNPRC_ComplianceSchema.NAME, userSchema);

        this.ID_FIELD = this.getjOOQTable().field(PROTOCOL_REVISIONS.ID);
    }

    @Override
    public Table<? extends Record> getjOOQTable() {
        try (jOOQConnection jOOQConnection = new jOOQConnection(WNPRC_ComplianceSchema.NAME, userSchema.getContainer(), userSchema.getUser())) {

            Field<String> mostRecentProtocolId = PROTOCOL_REVISIONS.PROTOCOL_ID.as("mostRecentProtocolId");
            Field<Timestamp> mostRecentDate = max(PROTOCOL_REVISIONS.APPROVAL_DATE);

            Table<? extends Record> mostRecentDates = jOOQConnection.create().select(mostRecentProtocolId, mostRecentDate)
                    .from(PROTOCOL_REVISIONS)
                    .groupBy(PROTOCOL_REVISIONS.PROTOCOL_ID)
                    .asTable();

            return jOOQConnection.create().select(PROTOCOL_REVISIONS.ID, mostRecentDates.field(mostRecentDate), mostRecentDates.field(mostRecentProtocolId))
                    .from(mostRecentDates)
                    .leftJoin(PROTOCOL_REVISIONS)
                    .on(
                            PROTOCOL_REVISIONS.PROTOCOL_ID.equal(mostRecentDates.field(mostRecentProtocolId))
                                    .and(
                                            PROTOCOL_REVISIONS.APPROVAL_DATE.equal(mostRecentDates.field(mostRecentDate))
                                    )
                    ).asTable().as(getName());
        }
    }
}
