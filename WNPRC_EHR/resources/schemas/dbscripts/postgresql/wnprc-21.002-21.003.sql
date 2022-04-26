CREATE TABLE wnprc.watermonitoring_access
(
    rowid                   serial                    NOT NULL,
    date                    TIMESTAMP,
    alloweduser             userid,
    project                 integer,
    principalinvestigator   varchar,
    createdby               userid,
    created                 TIMESTAMP,
    modifiedby              userid,
    modified                TIMESTAMP,
    CONSTRAINT PK_watermonitoring_access PRIMARY KEY (rowid)
);