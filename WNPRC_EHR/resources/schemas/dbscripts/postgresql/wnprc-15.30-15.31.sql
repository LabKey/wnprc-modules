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

-- *******************************
-- wnprc-0.00-15.00
-- *******************************

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

-- *******************************
-- wnprc-15.10-15.11
-- *******************************

DROP TABLE IF EXISTS wnprc.necropsy_suite;
CREATE TABLE wnprc.necropsy_suite (
  room TEXT,

  disabled_on   TIMESTAMP,
  display_color TEXT,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_necropsy_suite PRIMARY KEY (room, container),

  --adding 'container' to below constraint to avoid teamcity failure/for users using bootstrapped db: org.postgresql.util.PSQLException: ERROR: there is no unique constraint matching given keys for referenced table "rooms"
  --this error is caused by 'room' no longer being a PK/unique in ehr_lookups.rooms as of ehr_lookups-18.11-18.12. This constraint will get dropped and re-added in wnprc-18.30-18.31.sql for production or staging server/non-bootstrapped db to take effect.
  CONSTRAINT fk_necropsy_suite_rooms FOREIGN KEY (container, room) REFERENCES ehr_lookups.rooms (container, room)
);

-- *******************************
-- wnprc-15.11-15.12
-- *******************************

-- Add a display name to the necropsy suite to display on the schedule.
ALTER TABLE wnprc.necropsy_suite
  ADD COLUMN displayName TEXT
;

-- Add a table to allow connections to external email accounts
DROP TABLE IF EXISTS wnprc.email_server;
CREATE TABLE wnprc.email_server (
  id TEXT,

  hostname     TEXT,
  protocol     TEXT DEFAULT 'pop3',
  port         INTEGER,
  display_name TEXT,
  use_ssl      BOOLEAN DEFAULT TRUE,

  -- Some other tracking info
  disabled_on   TIMESTAMP,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_email_server PRIMARY KEY (id, container)
);

-- *******************************
-- wnprc-15.12-15.13
-- *******************************

DROP TABLE IF EXISTS wnprc.vvc;
CREATE TABLE wnprc.vvc(
  rowid serial NOT NULL,
  date TIMESTAMP,
  dateapproved TIMESTAMP,
  pi varchar (100) NOT NULL,
  protocol varchar (100) NOT NULL,
  description TEXT,
  rationale TEXT,
  veterinarian userid,
  requestid varchar(100),
  taskid varchar(100),
  QCState integer ,
  /*QCState integer NOT NULL,*/


  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_vvc PRIMARY KEY (rowid)


);

-- *******************************
-- wnprc-15.14-15.15
-- *******************************

-- Intentionally skipped to avoid messing with other EHR instances that might be on a dev server