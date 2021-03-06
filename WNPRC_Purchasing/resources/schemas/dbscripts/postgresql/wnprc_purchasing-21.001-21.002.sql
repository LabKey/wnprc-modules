DROP TABLE wnprc_purchasing.creditCardOptions;

CREATE TABLE wnprc_purchasing.paymentOptions
(
    rowId       serial,
    paymentOption  varchar(500),
    container   ENTITYID NOT NULL,
    createdBy   USERID,
    created     timestamp,
    modifiedBy  USERID,
    modified    timestamp,

    CONSTRAINT PK_WNPRC_PURCHASING_PAYMENT_OPTIONS PRIMARY KEY (rowId),
    CONSTRAINT FK_WNPRC_PURCHASING_PAYMENT_OPTIONS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_WNPRC_PURCHASING_PAYMENT_OPTIONS_CONTAINER ON wnprc_purchasing.paymentOptions(Container);