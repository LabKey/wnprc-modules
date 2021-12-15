DROP TABLE IF EXISTS wnprc.mgap_sequence_datasets;
CREATE TABLE wnprc.mgap_sequence_datasets
(
    mgap_id         VARCHAR(255) NOT NULL,
    sequence_type   VARCHAR(255),
    total_reads     INTEGER,
    sra_accession   VARCHAR(255),
    original_id     VARCHAR(255),
    parsed_id       VARCHAR(255),

    -- Default fields for LabKey.
    container       entityid NOT NULL,
    createdby       userid,
    created         TIMESTAMP,
    modifiedby      userid,
    modified        TIMESTAMP,

    CONSTRAINT PK_mgap_sequence_datasets PRIMARY KEY (mgap_id, sequence_type, sra_accession)
);