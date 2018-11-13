/*
 * Copyright (c) 2017-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

/* wnprc_billing-17.34-17.35.sql */

DROP TABLE IF EXISTS wnprc_billing.chargeRateExemptions;
DROP TABLE IF EXISTS wnprc_billing.chargeUnits;

/* wnprc_billing-17.35-17.36.sql */

INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Animal Replacement');
INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Blood Draws');

/* wnprc_billing-17.36-17.37.sql */

ALTER TABLE wnprc_billing.tierrates DROP COLUMN CONTAINER;