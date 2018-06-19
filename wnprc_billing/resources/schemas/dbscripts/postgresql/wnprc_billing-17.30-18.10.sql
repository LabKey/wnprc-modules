/* wnprc_billing-17.30-17.31.sql */

DROP TABLE IF EXISTS wnprc_billing.miscCharges;
DROP TABLE IF EXISTS wnprc_billing.invoiceRuns;
DROP TABLE IF EXISTS wnprc_billing.invoicedItems;

/* wnprc_billing-17.31-17.32.sql */

DROP TABLE IF EXISTS wnprc_billing.chargeableItems;

/* wnprc_billing-17.32-17.33.sql */

DROP TABLE IF EXISTS wnprc_billing.tierRates;

CREATE TABLE wnprc_billing.tierRates(

  rowId SERIAL NOT NULL,
  tierRateType varchar(2),
  tierRate double precision,
  startDate timestamp,
  endDate timestamp,
  isActive boolean,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_WNPRC_BILLING_TIERRATES PRIMARY KEY (rowId),
  CONSTRAINT FK_WNPRC_BILLING_TIERRATES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)

);
CREATE INDEX WNPRC_BILLING_TIERRATES_CONTAINER_INDEX ON wnprc_billing.tierRates (Container);

/* wnprc_billing-17.33-17.34.sql */

ALTER TABLE wnprc_billing.affiliates ADD CONSTRAINT PK_WNPRC_BILLING_AFFILIATES PRIMARY KEY (rowId);