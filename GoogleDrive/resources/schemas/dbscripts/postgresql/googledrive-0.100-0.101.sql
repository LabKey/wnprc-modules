/*
 * Copyright (c) 2017-2026 Board of Regents of the University of Wisconsin System
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
-- Create schema, tables, indexes, and constraints used for GoogleDrive module here
-- All SQL VIEW definitions should be created in googledrive-create.sql and dropped in googledrive-drop.sql
CREATE SCHEMA googledrive;

CREATE TABLE googledrive.service_accounts (
  id           TEXT NOT NULL,
  display_name TEXT,

  project_id     TEXT NOT NULL,
  private_key_id TEXT NOT NULL,
  private_key    TEXT NOT NULL,
  client_email   TEXT NOT NULL,
  client_id      TEXT NOT NULL,
  auth_uri       TEXT NOT NULL,
  token_uri      TEXT NOT NULL,
  client_x509_cert_url        TEXT NOT NULL,
  auth_provider_x509_cert_url TEXT NOT NULL,

  -- Default fields for LabKey.
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_service_accounts PRIMARY KEY (id)
);