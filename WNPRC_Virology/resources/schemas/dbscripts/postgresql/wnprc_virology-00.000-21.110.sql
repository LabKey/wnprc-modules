CREATE SCHEMA wnprc_virology;

DROP TABLE IF EXISTS wnprc_virology.assays_llod;
CREATE TABLE wnprc_virology.assays_llod
(
    rowid		    serial NOT NULL,
    assay_name		text NOT NULL,
    start_date		TIMESTAMP NOT NULL,
    end_date		TIMESTAMP DEFAULT NULL,
    llod		    integer NOT NULL,

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT fk_assay_name FOREIGN KEY (assay_name) REFERENCES Viral_Load_Assay.assays(assayname),

    CONSTRAINT pk_assays_llod_rowid PRIMARY KEY (rowid)
);

