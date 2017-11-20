package org.labkey.wnprc_compliance.protocol;

import org.labkey.api.data.Container;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.dbutils.jooq.jOOQConnection;
import org.labkey.wnprc_compliance.WNPRC_ComplianceSchema;
import org.labkey.wnprc_compliance.lookups.SpeciesClass;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolRevisionsRecord;

import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOL_REVISIONS;

/**
 * Created by jon on 4/18/17.
 */
public class ProtocolRevisionSpeciesInfo {
    protected User user;
    protected Container container;
    protected String revisionId;
    protected SpeciesClass speciesClass;

    ProtocolRevisionSpeciesInfo(String revisionId, User user, Container container, SpeciesClass speciesClass) throws DoesNotExistException {
        this.revisionId = revisionId;
        this.user = user;
        this.container = container;
        this.speciesClass = speciesClass;

        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord record = conn.create().fetchOne(PROTOCOL_REVISIONS, PROTOCOL_REVISIONS.ID.equal(this.revisionId));

            if (record == null) {
                throw new DoesNotExistException();
            }
        }
    }

    private UserSchema getUserSchema() {
        return new WNPRC_ComplianceSchema(user, container);
    }

    public static class DoesNotExistException extends Exception {}
}
