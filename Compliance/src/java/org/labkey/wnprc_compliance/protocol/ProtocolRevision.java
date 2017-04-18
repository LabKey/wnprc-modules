package org.labkey.wnprc_compliance.protocol;

import org.labkey.api.data.Container;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.SkipMothershipLogging;
import org.labkey.dbutils.jooq.jOOQConnection;
import org.labkey.wnprc_compliance.WNPRC_ComplianceSchema;
import org.labkey.wnprc_compliance.lookups.SpeciesClass;
import org.labkey.wnprc_compliance.model.jooq.tables.records.AllowedSpeciesRecord;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolRevisionsRecord;
import org.labkey.wnprc_compliance.protocol.messages.BasicInfoForm;
import org.labkey.wnprc_compliance.protocol.messages.HazardsForm;

import java.sql.Timestamp;
import java.util.Date;

import static org.labkey.wnprc_compliance.model.jooq.Tables.ALLOWED_SPECIES;
import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOL_REVISIONS;

/**
 * Created by jon on 4/18/17.
 */
public class ProtocolRevision {
    protected User user;
    protected Container container;
    protected String revisionId;

    ProtocolRevision(String revisionId, User user, Container container) throws ProtocolDoesNotExistException {
        this.revisionId = revisionId;
        this.user = user;
        this.container = container;

        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord record = conn.create().fetchOne(PROTOCOL_REVISIONS, PROTOCOL_REVISIONS.ID.equal(this.revisionId));

            if (record == null) {
                throw new ProtocolDoesNotExistException();
            }
        }
    }

    private ProtocolRevisionsRecord getRevisionRecord(jOOQConnection connection) {
        ProtocolRevisionsRecord record = connection.create().fetchOne(PROTOCOL_REVISIONS, PROTOCOL_REVISIONS.ID.equal(this.revisionId));
        return record;
    }

    public BasicInfoForm getBasicInfo() {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord record = getRevisionRecord(conn);

            BasicInfoForm form = new BasicInfoForm();
            form.revision_id = record.getId();
            form.principal_investigator = record.getPrincipalInvestigatorId();
            form.spi_primary = record.getSpiPrimaryId();
            form.spi_secondary = record.getSpiSecondaryId();
            form.approval_date = new Date(record.getApprovalDate().getTime());

            return form;
        }
    }

    public void saveBasicInfo(BasicInfoForm form) {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord record = getRevisionRecord(conn);

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

    public HazardsForm getHazardsInfo() {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord record = getRevisionRecord(conn);

            HazardsForm form = new HazardsForm();
            form.biological  = record.getHasBiologicalHazards();
            form.chemical    = record.getHasChemicalHazards();
            form.physical    = record.getHasPhysicalHazards();
            form.other       = record.getHasOtherHazards();
            form.other_notes = record.getOtherHazardsNotes();

            return form;
        }
    }

    public HazardsForm saveHazardsInfo(HazardsForm form) {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord record = getRevisionRecord(conn);

            record.setHasBiologicalHazards(form.biological);
            record.setHasChemicalHazards(form.chemical);
            record.setHasPhysicalHazards(form.physical);
            record.setHasOtherHazards(form.other);
            record.setOtherHazardsNotes(form.other_notes);
            record.store();

            return form;
        }
    }

    public SpeciesInfo getSpeciesInfo(SpeciesClass speciesClass) throws ProtocolDoesNotAllowSpecies {
        return new SpeciesInfo(speciesClass);
    }

    public class SpeciesInfo {
        protected SpeciesClass speciesClass;

        SpeciesInfo(SpeciesClass speciesClass) throws ProtocolDoesNotAllowSpecies {
                this.speciesClass = speciesClass;

                try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
                    AllowedSpeciesRecord record = getRecord(conn);

                if (record == null) {
                    throw new ProtocolDoesNotAllowSpecies();
                }
            }
        }

        private AllowedSpeciesRecord getRecord(jOOQConnection conn) {
            return conn.create().fetchOne(ALLOWED_SPECIES, ALLOWED_SPECIES.PROTOCOL_REVISION_ID.eq(revisionId).and(ALLOWED_SPECIES.SPECIES_CLASSIFIER.eq(speciesClass.name())));
        }

        public void setMaxNumberOfAnimals(int maxNoAnimals) {
            try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
                AllowedSpeciesRecord record = getRecord(conn);
                record.setMaxNumberOfAnimals(maxNoAnimals);
                record.store();
            }
        }
    }

    public static class ProtocolDoesNotExistException extends Exception implements SkipMothershipLogging {}
    public static class ProtocolDoesNotAllowSpecies extends Exception implements SkipMothershipLogging {}
}
