CREATE SCHEMA wnprc_purchasing;

CREATE TABLE wnprc_purchasing.creditCardOptions
(
    rowId       serial,
    cardOption  varchar(500),
    container   ENTITYID NOT NULL,
    createdBy   USERID,
    created     timestamp,
    modifiedBy  USERID,
    modified    timestamp,

    CONSTRAINT PK_WNPRC_PURCHASING_CREDIT_CARD_OPTIONS PRIMARY KEY (rowId),
    CONSTRAINT FK_WNPRC_PURCHASING_CREDIT_CARD_OPTIONS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_WNPRC_PURCHASING_CREDIT_CARD_CONTAINER ON wnprc_purchasing.creditCardOptions(Container);