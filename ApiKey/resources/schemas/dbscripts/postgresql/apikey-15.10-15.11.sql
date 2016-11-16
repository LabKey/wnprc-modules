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

-- Create schema, tables, indexes, and constraints used for ApiKey module here
-- All SQL VIEW definitions should be created in apikey-create.sql and dropped in apikey-drop.sql
CREATE SCHEMA apikey;

CREATE TABLE apikey.apikeys (
  apikey     TEXT NOT NULL,

  note       TEXT,
  isSuperKey BOOLEAN NOT NULL DEFAULT FALSE,
  owner      USERID NOT NULL,
  starts     TIMESTAMP,
  expires    TIMESTAMP,

  CONSTRAINT PK_apikeys PRIMARY KEY (apikey)
);

CREATE TABLE apikey.key_revocations (
  apikey TEXT NOT NULL,

  revokedOn TIMESTAMP NOT NULL,
  revokedBy USERID    NOT NULL,
  reason    TEXT,

  CONSTRAINT PK_key_revocations PRIMARY KEY (apikey),
  CONSTRAINT FK_key_revocations_apikeys FOREIGN KEY (apikey) REFERENCES apikeys (apikey)
);

CREATE TABLE apikey.allowed_services (
  apikey     TEXT NOT NULL,

  moduleName  TEXT NOT NULL,
  serviceName TEXT NOT NULL,

  CONSTRAINT PK_services PRIMARY KEY (apikey, moduleName, serviceName),
  CONSTRAINT FK_key_revocations_apikeys FOREIGN KEY (apikey) REFERENCES apikeys (apikey)
);