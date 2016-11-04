/*
 * Copyright (c) 2015 LabKey Corporation
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

-- Create schema, tables, indexes, and constraints used for Gringotts module here
-- All SQL VIEW definitions should be created in gringotts-create.sql and dropped in gringotts-drop.sql
CREATE SCHEMA gringotts;

CREATE TABLE gringotts.vaults (
  vaultId       TEXT NOT NULL,
  vaultName     TEXT NOT NULL,

  -- Default fields for LabKey.
  --container  entityid NOT NULL, -- Vaults shouldn't be container scoped.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_vaults PRIMARY KEY (vaultId)
);

CREATE TABLE gringotts.transactions (
  createdOn     TIMESTAMP DEFAULT current_timestamp,

  transactionId TEXT NOT NULL,
  "user"        userid,

  CONSTRAINT PK_transactions PRIMARY KEY (createdOn),
  CONSTRAINT transactions_id_unique UNIQUE (transactionId)
);

CREATE TABLE gringotts.vault_columns (
  vaultId    TEXT NOT NULL,
  version    INTEGER,
  columnName TEXT,

  type       TEXT,
  columnId   TEXT,

  CONSTRAINT PK_vault_columns PRIMARY KEY (vaultId, version, columnName)
);

CREATE TABLE gringotts.records (
  vaultId   TEXT     NOT NULL,
  recordId  TEXT     DEFAULT dbutils.generate_base64_uuid(),
  container ENTITYID NOT NULL,
  version   INTEGER,

  transactionId TEXT NOT NULL,

  CONSTRAINT PK_records PRIMARY KEY (vaultId, recordId, container, version)
);

CREATE TABLE gringotts.vault_text_values (
  vaultId       TEXT     NOT NULL,
  recordId      TEXT     NOT NULL,
  container     ENTITYID NOT NULL,
  columnId      TEXT     NOT NULL,
  transactionId TEXT     NOT NULL,

  value         TEXT,
  effectiveDate TIMESTAMP,

  CONSTRAINT PK_vault_text_values PRIMARY KEY (vaultId, recordId, container, columnId, transactionId)
);

CREATE TABLE gringotts.vault_links (
  -- "Primary" primary keys
  vaultId1 TEXT NOT NULL, -- source
  columnId TEXT NOT NULL,
  vaultId2 TEXT NOT NULL, -- target

  --  "Secondary" primary keys
  record1       TEXT NOT NULL, -- source
  record2       TEXT NOT NULL, -- target
  transactionId TEXT NOT NULL,

  isLinked BOOLEAN NOT NULL DEFAULT TRUE,
  "order"  INTEGER,

  CONSTRAINT PK_vault_links PRIMARY KEY (vaultId1, columnId, vaultId2, record1, record2, transactionId)
);