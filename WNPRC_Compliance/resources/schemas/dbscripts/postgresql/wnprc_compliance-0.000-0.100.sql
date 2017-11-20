-- Create schema, tables, indexes, and constraints used for wnprc_compliance module here
-- All SQL VIEW definitions should be created in wnprc_compliance-create.sql and dropped in wnprc_compliance-drop.sql
DROP SCHEMA IF EXISTS wnprc_compliance CASCADE;
CREATE SCHEMA wnprc_compliance;

DROP TABLE IF EXISTS wnprc_compliance.persons;
CREATE TABLE wnprc_compliance.persons (
  personid TEXT,

  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  notes TEXT,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_persons PRIMARY KEY (personid)
);

DROP TABLE IF EXISTS wnprc_compliance.tb_clearances;
CREATE TABLE wnprc_compliance.tb_clearances (
  id TEXT,

  date TIMESTAMP,
  comment TEXT,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_tb_clearances PRIMARY KEY (id)
);

DROP TABLE IF EXISTS wnprc_compliance.pending_tb_clearances;
CREATE TABLE wnprc_compliance.pending_tb_clearances (
  id TEXT,

  date           TIMESTAMP,
  comment        TEXT,
  tbclearance_id TEXT,
  archived       BOOLEAN DEFAULT FALSE,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_pending_tb_clearances PRIMARY KEY (id)
);


DROP TABLE IF EXISTS wnprc_compliance.persons_pending_tb_clearances;
CREATE TABLE wnprc_compliance.persons_pending_tb_clearances (
  person_id TEXT,
  clearance_id TEXT,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_persons_pending_tb_clearances PRIMARY KEY (person_id, clearance_id),
  CONSTRAINT FK_persons_pending_tb_clearances_persons FOREIGN KEY (person_id) REFERENCES wnprc_compliance.persons (personid),
  CONSTRAINT FK_persons_pending_tb_clearances_pending_clearances FOREIGN KEY (clearance_id) REFERENCES wnprc_compliance.pending_tb_clearances (id)
);

DROP TABLE IF EXISTS wnprc_compliance.persons_tb_clearances;
CREATE TABLE wnprc_compliance.persons_tb_clearances (
  person_id TEXT,
  clearance_id TEXT,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_persons_tb_clearances PRIMARY KEY (person_id, clearance_id),
  CONSTRAINT FK_persons_tb_clearances_persons FOREIGN KEY (person_id) REFERENCES wnprc_compliance.persons (personid),
  CONSTRAINT FK_persons_tb_clearances_clearances FOREIGN KEY (clearance_id) REFERENCES wnprc_compliance.tb_clearances (id)
);

DROP TABLE IF EXISTS wnprc_compliance.measles_clearances;
CREATE TABLE wnprc_compliance.measles_clearances (
  id TEXT,

  date TIMESTAMP,
  comment TEXT,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_measles_clearances PRIMARY KEY (id)
);

DROP TABLE IF EXISTS wnprc_compliance.persons_measles_clearances;
CREATE TABLE wnprc_compliance.persons_measles_clearances (
  person_id TEXT,
  clearance_id TEXT,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_persons_measles_clearances PRIMARY KEY (person_id, clearance_id),
  CONSTRAINT FK_persons_measles_clearances_persons FOREIGN KEY (person_id) REFERENCES wnprc_compliance.persons (personid),
  CONSTRAINT FK_persons_measles_clearances_clearances FOREIGN KEY (clearance_id) REFERENCES wnprc_compliance.measles_clearances (id)
);

DROP TABLE IF EXISTS wnprc_compliance.access_reports;
CREATE TABLE wnprc_compliance.access_reports (
  report_id TEXT,

  date TIMESTAMP NOT NULL UNIQUE,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_access_reports PRIMARY KEY (report_id)
);

DROP TABLE IF EXISTS wnprc_compliance.access_report_data;
CREATE TABLE wnprc_compliance.access_report_data (
  report_id TEXT,
  area TEXT,
  card_id TEXT,

  schedule_pt TEXT,
  enabled boolean,
  last_entered TIMESTAMP,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_access_report_data PRIMARY KEY (report_id, area, card_id),
  CONSTRAINT FK_access_report_data_access_reports FOREIGN KEY (report_id) REFERENCES wnprc_compliance.access_reports (report_id)
);

DROP TABLE IF EXISTS wnprc_compliance.cards;
CREATE TABLE wnprc_compliance.cards (
  card_id TEXT,

  exempt BOOLEAN DEFAULT FALSE,
  exempt_reason TEXT,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_cards PRIMARY KEY (card_id, container)
);

DROP TABLE IF EXISTS wnprc_compliance.card_info;
CREATE TABLE wnprc_compliance.card_info (
  report_id TEXT,
  card_id TEXT,

  first_name  TEXT,
  last_name   TEXT,
  middle_name TEXT,
  department  TEXT,
  employee_number TEXT,
  info2 TEXT, --  <--+
  info3 TEXT, --  <--+-- These are what the UW Police call these fields.  They are noticably non-descript.
  info5 TEXT, --  <--+

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_card_info PRIMARY KEY (report_id, card_id),
  CONSTRAINT FK_card_info_access_reports FOREIGN KEY (report_id) REFERENCES wnprc_compliance.access_reports (report_id),
  CONSTRAINT FK_card_info_cards FOREIGN KEY (card_id, container) REFERENCES wnprc_compliance.cards (card_id, container)
);

DROP TABLE IF EXISTS wnprc_compliance.persons_to_cards;
CREATE TABLE wnprc_compliance.persons_to_cards (
  personid TEXT,
  cardid TEXT,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_persons_to_cards PRIMARY KEY (personid, cardid, container),
  CONSTRAINT FK_persons_to_cards_persons FOREIGN KEY (personid) REFERENCES wnprc_compliance.persons (personid),
  CONSTRAINT FK_persons_to_cards_cards FOREIGN KEY (cardid, container) REFERENCES wnprc_compliance.cards (card_id, container)
);

DROP TABLE IF EXISTS wnprc_compliance.persons_to_users;
CREATE TABLE wnprc_compliance.persons_to_users (
  personid TEXT,
  userid USERID,

  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT PK_persons_to_users PRIMARY KEY (personid, userid, container),
  CONSTRAINT FK_persons_to_cards_persons FOREIGN KEY (personid) REFERENCES wnprc_compliance.persons (personid)
);