package org.labkey.wnprc_compliance.protocol;

import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.dbutils.jooq.jOOQConnection;
import org.labkey.wnprc_compliance.WNPRC_ComplianceSchema;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolRevisionsRecord;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolsRecord;
import org.labkey.wnprc_compliance.protocol.messages.BasicInfoForm;
import org.labkey.wnprc_compliance.protocol.messages.NewProtocolForm;
import org.labkey.wnprc_compliance.protocol.messages.NewProtocolResponse;

import java.sql.Timestamp;
import java.util.UUID;

import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOLS;
import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOL_REVISIONS;

/**
 * Created by jon on 3/21/17.
 */
public class ProtocolService {
    protected User user;
    protected Container container;

    public ProtocolService(User user, Container container) {
        this.user = user;
        this.container = container;
    }

    public NewProtocolResponse newProtocol(NewProtocolForm protocol) {
        String protocol_entity_id = UUID.randomUUID().toString().toUpperCase();
        String revision_id = UUID.randomUUID().toString().toUpperCase();

        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME)) {
            conn.create().transaction(configuration -> {
                DSLContext create = DSL.using(configuration);

                ProtocolsRecord record = create.newRecord(PROTOCOLS);
                record.setId(protocol_entity_id);
                record.setProtocolNumber(protocol.id);
                record.setContainer(this.container.getId());
                record.store();

                ProtocolRevisionsRecord revisionRecord = create.newRecord(PROTOCOL_REVISIONS);
                revisionRecord.setId(revision_id);
                revisionRecord.setProtocolId(protocol_entity_id);
                revisionRecord.setApprovalDate(new Timestamp(protocol.approval_date.getTime()));
                revisionRecord.store();
            });
        }

        NewProtocolResponse response = new NewProtocolResponse();
        response.protocol_id = protocol_entity_id;
        response.revision_id = revision_id;

        return response;
    }

    public void saveBasicInfo(BasicInfoForm form) {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME)) {
            ProtocolRevisionsRecord record = conn.create().fetchOne(PROTOCOL_REVISIONS, PROTOCOL_REVISIONS.ID.equal(form.revision_id));

            record.setPrincipalInvestigatorId(form.principal_investigator);
            record.setSpiPrimaryId(form.spi_primary);
            record.setSpiSecondaryId(form.spi_secondary);
            record.setApprovalDate(new Timestamp(form.approval_date.getTime()));

            record.store();
        }
    }
}
