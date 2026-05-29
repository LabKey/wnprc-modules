/*
 * Copyright (c) 2022-2026 Board of Regents of the University of Wisconsin System
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
DROP TABLE IF EXISTS wnprc_purchasing.creditCardOptions;

CREATE TABLE IF NOT EXISTS wnprc_purchasing.paymentOptions
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

CREATE INDEX IF NOT EXISTS IDX_WNPRC_PURCHASING_PAYMENT_OPTIONS_CONTAINER ON wnprc_purchasing.paymentOptions(Container);