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

CREATE TABLE wnprc_billing.tierRates(

    rowId SERIAL NOT NULL,
    tierRate_2 double precision,
    tierRate_2A double precision,
    tierRate_3 double precision,
    startDate timestamp,
    endDate timestamp,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_WNPRC_BILLING_TIERRATES PRIMARY KEY (rowId),
    CONSTRAINT FK_WNPRC_BILLING_TIERRATES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)

);
CREATE INDEX WNPRC_BILLING_TIERRATES_CONTAINER_INDEX ON wnprc_billing.tierRates (Container);

CREATE TABLE wnprc_billing.groups(

    rowId SERIAL NOT NULL,
    name varchar(50),
    active boolean default true,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_WNPRC_BILLING_GROUPS PRIMARY KEY (rowId),
    CONSTRAINT FK_WNPRC_BILLING_GROUPS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)

);
CREATE INDEX WNPRC_BILLING_GROUPS_CONTAINER_INDEX ON wnprc_billing.groups (Container);

CREATE TABLE wnprc_billing.affiliates (

  rowId SERIAL NOT NULL,
  affiliate varchar(100)

);

INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('WNPRC_core');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('ICTR');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('National_CTSA');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('National_Primate_Center');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('UW_campus');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('Other_Universities_organizations');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('Commercial');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('Exception_N/C');

TRUNCATE TABLE wnprc_billing.aliasCategories;