DROP TABLE IF EXISTS wnprc.urgent_treatments;
CREATE TABLE wnprc.urgent_treatments
(
    rowid SERIAL NOT NULL,
    code VARCHAR NOT NULL,
    instructions VARCHAR(255),
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_urgent_treatments PRIMARY KEY (rowid),
    CONSTRAINT FK_urgent_treatments_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);