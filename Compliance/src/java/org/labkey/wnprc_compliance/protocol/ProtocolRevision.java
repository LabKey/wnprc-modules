package org.labkey.wnprc_compliance.protocol;

import com.drew.lang.annotations.NotNull;
import org.jooq.impl.DSL;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.api.util.SkipMothershipLogging;
import org.labkey.dbutils.jooq.jOOQConnection;
import org.labkey.wnprc_compliance.WNPRC_ComplianceSchema;
import org.labkey.wnprc_compliance.lookups.SpeciesClass;
import org.labkey.wnprc_compliance.model.jooq.tables.records.AllowedSpeciesRecord;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolRevisionsRecord;
import org.labkey.wnprc_compliance.model.jooq.tables.records.ProtocolsRecord;
import org.labkey.wnprc_compliance.protocol.messages.*;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import static org.labkey.wnprc_compliance.model.jooq.Tables.ALLOWED_SPECIES;
import static org.labkey.wnprc_compliance.model.jooq.Tables.PROTOCOLS;
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

    public ProtocolRevisionsForm getRevisions() {
        ProtocolRevisionsForm form = new ProtocolRevisionsForm();

        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord currentRevisionRecord = getRevisionRecord(conn);

            List<ProtocolRevisionsRecord> otherRevisions = conn.create().fetch(PROTOCOL_REVISIONS, PROTOCOL_REVISIONS.PROTOCOL_ID.eq(currentRevisionRecord.getProtocolId()));

            for (ProtocolRevisionsRecord revision : otherRevisions) {
                ProtocolRevisionForm revisionForm = new ProtocolRevisionForm();
                revisionForm.revision_id = revision.getId();
                revisionForm.approval_date = new Date(revision.getApprovalDate().getTime());

                form.revisions.add(revisionForm);
            }

            ProtocolsRecord protocol = conn.create().fetchOne(PROTOCOLS, PROTOCOLS.ID.eq(currentRevisionRecord.getProtocolId()));
            form.name = protocol.getProtocolNumber();
        }

        return form;
    }

    public BasicInfoForm getBasicInfo() {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            ProtocolRevisionsRecord revisionRecord = getRevisionRecord(conn);

            BasicInfoForm form = new BasicInfoForm();
            form.revision_id = revisionRecord.getId();
            form.principal_investigator = revisionRecord.getPrincipalInvestigatorId();
            form.spi_primary   = revisionRecord.getSpiPrimaryId();
            form.spi_secondary = revisionRecord.getSpiSecondaryId();
            form.approval_date = new Date(revisionRecord.getApprovalDate().getTime());

            ProtocolsRecord protocolsRecord = conn.create().fetchOne(PROTOCOLS, PROTOCOLS.ID.eq(revisionRecord.getProtocolId()));
            form.protocol_name = protocolsRecord.getProtocolNumber();

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

    public void addAllowedSpecies(@NotNull SpeciesClass speciesClass) {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            AllowedSpeciesRecord record = conn.create().fetchOne(ALLOWED_SPECIES, ALLOWED_SPECIES.PROTOCOL_REVISION_ID.eq(revisionId).and(ALLOWED_SPECIES.SPECIES_CLASSIFIER.eq(speciesClass.name())));

            try {
                SpeciesInfo speciesInfo = new SpeciesInfo(speciesClass);
            } catch (ProtocolDoesNotAllowSpecies protocolDoesNotAllowSpecies) {
                // Create a new record
                record = conn.create().newRecord(ALLOWED_SPECIES);

                // Set primary key
                record.setProtocolRevisionId(revisionId);
                record.setSpeciesClassifier(speciesClass.name());

                // Set some defaults
                record.setMaxNumberOfAnimals(0);

                // Persist
                record.store();
            }
        }
    }

    public void deleteSpeciesFromProtocol(@NotNull SpeciesClass speciesClass) {
        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            conn.create().transaction((configuration -> {
                AllowedSpeciesRecord allowedSpeciesRecord = DSL.using(configuration).fetchOne(ALLOWED_SPECIES, ALLOWED_SPECIES.PROTOCOL_REVISION_ID.eq(revisionId).and(ALLOWED_SPECIES.SPECIES_CLASSIFIER.eq(speciesClass.name())));

                // If it doesn't exist, we have nothing to do.
                if (allowedSpeciesRecord == null) {
                    return;
                }

                allowedSpeciesRecord.delete();
            }));
        }
    }

    public AllowedSpeciesForm getAllowedSpecies() {
        AllowedSpeciesForm form = new AllowedSpeciesForm();

        try (jOOQConnection conn = new jOOQConnection(WNPRC_ComplianceSchema.NAME, container, user)) {
            conn.create().transaction((configuration -> {
                List<AllowedSpeciesRecord> allowedSpeciesRecords = DSL.using(configuration).fetch(ALLOWED_SPECIES, ALLOWED_SPECIES.PROTOCOL_REVISION_ID.eq(revisionId));

                // If it doesn't exist, we have nothing to do.
                if (allowedSpeciesRecords == null) {
                    return;
                }

                for (AllowedSpeciesRecord record : allowedSpeciesRecords) {
                    SpeciesForm speciesForm = new SpeciesForm();

                    speciesForm.maxNumberOfAnimals = record.getMaxNumberOfAnimals();
                    speciesForm.speciesClass = SpeciesClass.valueOf(record.getSpeciesClassifier());

                    form.species.add(speciesForm);
                }
            }));
        }

        return form;
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
