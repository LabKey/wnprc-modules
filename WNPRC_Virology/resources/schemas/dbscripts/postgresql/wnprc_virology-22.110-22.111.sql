DROP TABLE IF EXISTS wnprc_virology.nucleic_acid_isolation_method CASCADE;
CREATE TABLE wnprc_virology.nucleic_acid_isolation_method
(
    Key                     int NOT NULL,
    RNA_isolation_method    varchar(1000),

    container           entityid NOT NULL,
    createdBy           userid,
    created             timestamp,
    modifiedBy          userid,
    modified            timestamp,

    CONSTRAINT PK_nucleic_acid_isolation_method PRIMARY KEY (Key)
);


