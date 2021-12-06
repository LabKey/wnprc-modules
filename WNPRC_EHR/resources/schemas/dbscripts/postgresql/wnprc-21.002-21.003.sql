CREATE TABLE wnprc.watermonitoring_access
(
    rowid                   serial                    NOT NULL,
    date                    TIMESTAMP,
    alloweduser             userid,
    project                 integer,
    createdBy               userid,
    principalinvestigator   userid,
    CONSTRAINT PK_watermonitoring_access PRIMARY KEY (rowid)
);

