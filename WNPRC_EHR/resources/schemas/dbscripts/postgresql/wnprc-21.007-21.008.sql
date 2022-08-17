CREATE TABLE IF NOT EXISTS wnprc.protocolProcedures
(
    rowid serial not null,
    protocol varchar(200) not null,
    procedureName varchar(200),
    code varchar(100),
    allowed integer,
    animalsAllowed integer,
    isTerminal boolean,
    startdate timestamp,
    enddate timestamp,
    objectid entityid,
    daysBetween integer,
    remark TEXT,

    container entityid NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_wnprcProtocolProcedures PRIMARY KEY (rowid),
    CONSTRAINT FK_wnprc_protocolProcedures_Container FOREIGN KEY (Container) REFERENCES core.Containers(EntityId)
);

CREATE INDEX IF NOT EXISTS IX_wnprc_protocolProcedures_Container ON wnprc.protocolProcedures (Container);