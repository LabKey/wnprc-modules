package org.labkey.wnprc_compliance.protocol;

import org.jooq.*;
import org.jooq.impl.DSL;
import org.labkey.api.data.Container;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.dbutils.jooq.jOOQConnection;
import org.labkey.wnprc_compliance.WNPRC_ComplianceSchema;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolRevisionsRecord;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolsRecord;
import org.labkey.wnprc_compliance.protocol.messages.*;
import org.labkey.wnprc_compliance.schema.tables.MostRecentProtocolRevision;

import java.sql.Timestamp;
import java.util.*;

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

    private UserSchema getUserSchema() {
        return new WNPRC_ComplianceSchema(user, container);
    }

    public NewProtocolResponse newProtocol(NewProtocolForm protocol) {
        String protocol_entity_id = UUID.randomUUID().toString().toUpperCase();
        String revision_id = UUID.randomUUID().toString().toUpperCase();

        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
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
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord record = conn.create().fetchOne(PROTOCOL_REVISIONS, PROTOCOL_REVISIONS.ID.equal(form.revision_id));

            if ("".equals(form.principal_investigator)) {
                form.principal_investigator = null;
            }

            if (form.principal_investigator != null) {
                record.setPrincipalInvestigatorId(form.principal_investigator);
            }

            if (form.spi_primary != null) {
                record.setSpiPrimaryId(form.spi_primary);
            }

            if (form.spi_secondary != null) {
                record.setSpiSecondaryId(form.spi_secondary);
            }

            if (form.approval_date != null) {
                record.setApprovalDate(new Timestamp(form.approval_date.getTime()));
            }

            record.store();
        }
    }

    public BasicInfoForm getBasicInfo(String revision_id) {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord record = conn.create().fetchOne(PROTOCOL_REVISIONS, PROTOCOL_REVISIONS.ID.equal(revision_id));

            BasicInfoForm form = new BasicInfoForm();
            form.revision_id = record.getId();
            form.principal_investigator = record.getPrincipalInvestigatorId();
            form.spi_primary = record.getSpiPrimaryId();
            form.spi_secondary = record.getSpiSecondaryId();
            form.approval_date = new Date(record.getApprovalDate().getTime());

            return form;
        }
    }

    public HazardsForm getHazardsInfo(String revision_id) {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord record = conn.create().fetchOne(PROTOCOL_REVISIONS, PROTOCOL_REVISIONS.ID.equal(revision_id));

            HazardsForm form = new HazardsForm();
            form.biological  = record.getHasBiologicalHazards();
            form.chemical    = record.getHasChemicalHazards();
            form.physical    = record.getHasPhysicalHazards();
            form.other       = record.getHasOtherHazards();
            form.other_notes = record.getOtherHazardsNotes();

            return form;
        }
    }

    public HazardsForm saveHazardsInfo(String revision_id, HazardsForm form) {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord record = conn.create().fetchOne(PROTOCOL_REVISIONS, PROTOCOL_REVISIONS.ID.equal(revision_id));

            record.setHasBiologicalHazards(form.biological);
            record.setHasChemicalHazards(form.chemical);
            record.setHasPhysicalHazards(form.physical);
            record.setHasOtherHazards(form.other);
            record.setOtherHazardsNotes(form.other_notes);
            record.store();

            return form;
        }
    }

    public List<ProtocolListItem> getProtocolList() {
        List<ProtocolListItem> protocols = new ArrayList<>();

        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            MostRecentProtocolRevision mostRecentProtocolRevisions = new MostRecentProtocolRevision(getUserSchema());

            List<Field> fieldList = new ArrayList<>();
            fieldList.addAll(Arrays.asList(PROTOCOL_REVISIONS.fields()));
            fieldList.add(PROTOCOLS.PROTOCOL_NUMBER);

            Field[] fields = new Field[fieldList.size()];
            fieldList.toArray(fields);

            Result<? extends Record> results = conn.create().select(fields)
                    .from(mostRecentProtocolRevisions.getjOOQTable())
                    .leftJoin(PROTOCOL_REVISIONS)
                    .on(PROTOCOL_REVISIONS.ID.eq(mostRecentProtocolRevisions.ID_FIELD))
                    .leftJoin(PROTOCOLS)
                    .on(PROTOCOLS.ID.eq(PROTOCOL_REVISIONS.PROTOCOL_ID))
                    .fetch();

            for (Record rec : results) {
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
