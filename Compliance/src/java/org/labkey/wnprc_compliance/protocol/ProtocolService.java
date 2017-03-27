package org.labkey.wnprc_compliance.protocol;

import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.Record6;
import org.jooq.Result;
import org.jooq.impl.DSL;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.dbutils.jooq.jOOQConnection;
import org.labkey.wnprc_compliance.WNPRC_ComplianceSchema;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolRevisionsRecord;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolsRecord;
import org.labkey.wnprc_compliance.protocol.messages.*;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
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

    public List<ProtocolListItem> getProtocolList() {
        List<ProtocolListItem> protocols = new ArrayList<>();

        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME)) {
            Result<Record6<String, String, Timestamp, Boolean, Boolean, Boolean>> ret = conn.create().select(
                    PROTOCOL_REVISIONS.ID,
                    PROTOCOLS.PROTOCOL_NUMBER,
                    PROTOCOL_REVISIONS.APPROVAL_DATE,
                    PROTOCOL_REVISIONS.HAS_BIOLOGICAL_HAZARDS,
                    PROTOCOL_REVISIONS.HAS_CHEMICAL_HAZARDS,
                    PROTOCOL_REVISIONS.HAS_PHYSICAL_HAZARDS
            ).from(PROTOCOL_REVISIONS)
                    .join(PROTOCOLS)
                    .on(PROTOCOL_REVISIONS.PROTOCOL_ID.eq(PROTOCOLS.ID))
                    .fetch();

            for (Record6<String, String, Timestamp, Boolean, Boolean, Boolean> rec : ret) {
                HazardsForm hazardsForm = new HazardsForm();
                hazardsForm.biological  = rec.getValue(PROTOCOL_REVISIONS.HAS_BIOLOGICAL_HAZARDS);
                hazardsForm.chemical    = rec.getValue(PROTOCOL_REVISIONS.HAS_CHEMICAL_HAZARDS);
                hazardsForm.physical    = rec.getValue(PROTOCOL_REVISIONS.HAS_PHYSICAL_HAZARDS);

                ProtocolListItem protocol = new ProtocolListItem();
                protocol.mostRecentApprovalDate = rec.getValue(PROTOCOL_REVISIONS.APPROVAL_DATE);
                protocol.mostRecentId = rec.getValue(PROTOCOL_REVISIONS.ID);
                protocol.protocol_number = rec.getValue(PROTOCOLS.PROTOCOL_NUMBER);

                protocol.hazards = hazardsForm;
                protocols.add(protocol);
            }
        }

        return protocols;
    }
}
