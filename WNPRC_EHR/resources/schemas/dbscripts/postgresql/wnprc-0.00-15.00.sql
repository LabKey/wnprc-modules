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

-- Create schema, tables, indexes, and constraints used for wnprc_hr module here
-- All SQL VIEW definitions should be created in wnprc-create.sql and dropped in wnprc-drop.sql
DROP SCHEMA IF EXISTS wnprc;
CREATE SCHEMA wnprc;

DROP TABLE IF EXISTS wnprc.external_labs;
CREATE TABLE wnprc.external_labs (
  code TEXT,
  lab_name TEXT,
  disabled_on TIMESTAMP,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_external_labs PRIMARY KEY (code, container)
);