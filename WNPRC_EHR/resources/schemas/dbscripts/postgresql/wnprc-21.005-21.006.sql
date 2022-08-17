DROP TABLE IF EXISTS wnprc.arrow_protocols;
CREATE TABLE wnprc.arrow_protocols
(
    rowid               SERIAL NOT NULL,
    protocol_id	        VARCHAR(255),
    protocol_title	    VARCHAR(255),
    pi_name	            VARCHAR(255),
    date_approved	    TIMESTAMP,
    date_expiration	    TIMESTAMP,
    date_modified	    TIMESTAMP,
    arrow_common_name	VARCHAR(255),
    max_three_year	    INTEGER,
    usda_code	        VARCHAR(255),

    -- Default fields for LabKey.
    container           entityid NOT NULL,
    createdby           userid,
    created             TIMESTAMP,
    modifiedby          userid,
    modified            TIMESTAMP,

    CONSTRAINT PK_arrow_protocols_sequence PRIMARY KEY (rowid)
);

DROP TABLE IF EXISTS wnprc.extra_protocols;
CREATE TABLE wnprc.extra_protocols
(
    rowid               SERIAL NOT NULL,
    protocol_id	        VARCHAR(255),
    protocol_title	    VARCHAR(255),
    pi_name	            VARCHAR(255),
    date_approved	    TIMESTAMP,
    date_expiration	    TIMESTAMP,
    date_modified	    TIMESTAMP,
    arrow_common_name	VARCHAR(255),
    max_three_year	    INTEGER,
    usda_code	        VARCHAR(255),

    -- Default fields for LabKey.
    container           entityid NOT NULL,
    createdby           userid,
    created             TIMESTAMP,
    modifiedby          userid,
    modified            TIMESTAMP,

    CONSTRAINT PK_extra_protocols_sequence PRIMARY KEY (rowid)
);

