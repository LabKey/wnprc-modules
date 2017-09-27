/*
 * Copyright (c) 2011-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* EHR-11.10-11.20.sql */

--- Dummy file to allow automatic install.
--- EHR module not compatible with sqlserver

/* EHR-11.30-12.10.sql */

/* EHR-11.34-11.35.sql */

CREATE SCHEMA ehr;
GO

CREATE TABLE ehr.animal_groups
(
  rowid INT IDENTITY(1,1) NOT NULL,
  name varchar(255) NOT NULL,
  container entityid NOT NULL,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,
  CONSTRAINT pk_animal_groups PRIMARY KEY (rowid )
);

CREATE TABLE ehr.automatic_alerts
(
  rowid INT IDENTITY(1,1) NOT NULL,
  title varchar(200) DEFAULT NULL,
  containerpath varchar(255) DEFAULT NULL,
  schemaname varchar(255) DEFAULT NULL,
  queryname varchar(255) DEFAULT NULL,
  viewname varchar(255) DEFAULT NULL,
  notificationtype varchar(100) DEFAULT NULL,
  email_html text,
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  CONSTRAINT pk_automatic_alerts PRIMARY KEY (rowid )
);

CREATE TABLE ehr.cage_observations
(
  rowid INT IDENTITY(1,1) NOT NULL,
  date datetime,
  room varchar(100),
  cage varchar(100),
  remark text,
  userid varchar(100),
  objectid entityid,
  taskid entityid,
  parentid entityid,
  qcstate integer,
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  description text,
  no_observations bit,
  feces varchar(100),
  CONSTRAINT pk_cage_observations PRIMARY KEY (rowid )
);

CREATE TABLE ehr.extracts
(
  rowid INT IDENTITY(1,1) NOT NULL,
  queryname varchar(100),
  schemaname varchar(100),
  containerpath varchar(100),
  viewname varchar(100),
  filename varchar(100),
  columns varchar(500),
  fieldstohash varchar(500),
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  CONSTRAINT pk_extracts PRIMARY KEY (rowid )
);

--note: field lengths altered
CREATE TABLE ehr.formpanelsections
(
  rowid INT IDENTITY(1,1) NOT NULL,
  formtype varchar(200) NOT NULL,
  destination varchar(200) NOT NULL,
  sort_order integer,
  xtype varchar(200) NOT NULL,
  schemaname varchar(200),
  queryname varchar(200),
  title varchar(200),
  metadatasources varchar(4000),
  buttons varchar(4000),
  initialtemplates varchar(4000),
  configjson text,
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  CONSTRAINT pk_formpanelsections PRIMARY KEY (rowid )
);

--note: field lengths altered
CREATE TABLE ehr.formtemplaterecords
(
  rowid INT IDENTITY(1,1) NOT NULL,
  templateid entityid NOT NULL,
  storeid varchar(1000) NOT NULL,
  json text,
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  CONSTRAINT pk_formtemplaterecords PRIMARY KEY (rowid )
);

--note: field lengths altered
CREATE TABLE ehr.formtemplates
(
  entityid entityid NOT NULL,
  title varchar(200) NOT NULL,
  formtype varchar(200) NOT NULL,
  template varchar(200),
  userid integer,
  description text,
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  CONSTRAINT pk_formtemplates PRIMARY KEY (entityid ),
  CONSTRAINT unique_formtemplates UNIQUE (formtype , title )
);

CREATE TABLE ehr.formtypes
(
  rowid INT IDENTITY(1,1) NOT NULL,
  formtype varchar(200) NOT NULL,
  category varchar(100),
  description text,
  configjson varchar(4000),
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  permitssingleidonly bit,
  CONSTRAINT pk_formtypes PRIMARY KEY (rowid ),
  CONSTRAINT unique_formtypes UNIQUE (container , formtype )
);

CREATE TABLE ehr.kinship
(
  rowid INT IDENTITY(1,1) NOT NULL,
  id varchar(100) NOT NULL,
  id2 varchar(100) NOT NULL,
  coefficient double precision,
  container entityid NOT NULL,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,
  CONSTRAINT pk_kinship PRIMARY KEY (rowid )
);

CREATE TABLE ehr.module_properties
(
  rowid INT IDENTITY(1,1) NOT NULL,
  prop_name varchar(255) DEFAULT NULL,
  stringvalue varchar(255) DEFAULT NULL,
  floatvalue double precision,
  container entityid NOT NULL,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,
  CONSTRAINT pk_module_properties PRIMARY KEY (rowid ),
  CONSTRAINT unique_module_properties UNIQUE (prop_name , container )
);

--note: field lengths altered
CREATE TABLE ehr.notificationrecipients
(
  rowid INT IDENTITY(1,1) NOT NULL,
  notificationtype varchar(200),
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  recipient integer,
  CONSTRAINT pk_notificationrecipients PRIMARY KEY (rowid )
);

--note: field lengths altered
CREATE TABLE ehr.notificationtypes
(
  notificationtype varchar(200) NOT NULL,
  description text,
  CONSTRAINT pk_notificationtypes PRIMARY KEY (notificationtype )
);

--note: field lengths altered
CREATE TABLE ehr.project
(
  project integer NOT NULL,
  protocol varchar(200),
  account varchar(200),
  inves varchar(200),
  avail varchar(100),
  title varchar(200),
  research bit,
  reqname varchar(200),
  requestid varchar(100),
  qcstate integer,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  CONSTRAINT pk_project PRIMARY KEY (project )
);

--note: field lengths altered
CREATE TABLE ehr.protocol
(
  protocol varchar(200) NOT NULL,
  inves varchar(200),
  approve datetime,
  description text,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  maxanimals integer,
  CONSTRAINT pk_protocol PRIMARY KEY (protocol )
);

--note: field lengths altered
CREATE TABLE ehr.protocol_counts
(
  rowid INT IDENTITY(1,1) NOT NULL,
  protocol varchar(200) NOT NULL,
  species varchar(200) NOT NULL,
  allowed integer NOT NULL,
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  CONSTRAINT pk_protocol_counts PRIMARY KEY (rowid )
);

--note: field lengths altered
CREATE TABLE ehr.protocolprocedures
(
  rowid INT IDENTITY(1,1) NOT NULL,
  protocol varchar(200) NOT NULL,
  procedurename varchar(200),
  code varchar(100),
  allowed double precision,
  frequency varchar(200),
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  CONSTRAINT pk_protocolprocedures PRIMARY KEY (rowid )
);

--note: field lengths altered
CREATE TABLE ehr.qcstatemetadata
(
  qcstatelabel varchar(200) NOT NULL,
  draftdata bit DEFAULT 0,
  isdeleted bit DEFAULT 0,
  isrequest bit DEFAULT 0,
  allowfuturedates bit,
  CONSTRAINT pk_qcstatemetadata PRIMARY KEY (qcstatelabel )
);

CREATE TABLE ehr.reports
(
  rowid INT IDENTITY(1,1) NOT NULL,
  reportname varchar(255) DEFAULT NULL,
  category varchar(255) DEFAULT NULL,
  reporttype varchar(255) DEFAULT NULL,
  reporttitle varchar(255) DEFAULT NULL,
  visible bit,
  containerpath varchar(255) DEFAULT NULL,
  schemaname varchar(255) DEFAULT NULL,
  queryname varchar(255) DEFAULT NULL,
  viewname varchar(255) DEFAULT NULL,
  report varchar(255) DEFAULT NULL,
  datefieldname varchar(255) DEFAULT NULL,
  todayonly bit,
  queryhaslocation bit,
  qcstatepublicdatafieldname varchar(255) DEFAULT NULL,
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  jsonconfig varchar(4000),
  description varchar(4000),
  sort_order integer,
  CONSTRAINT pk_reports PRIMARY KEY (rowid )
);

--note: field lengths altered
CREATE TABLE ehr.requests
(
  requestid entityid NOT NULL,
  rowid INT IDENTITY(1,1) NOT NULL,
  title varchar(200),
  formtype varchar(200),
  priority varchar(200),
  notify1 integer,
  notify2 integer,
  notify3 integer,
  pi varchar(200),
  qcstate integer,
  description text,
  daterequested datetime,
  enddate datetime,
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  remark varchar(4000),
  CONSTRAINT pk_requests PRIMARY KEY (requestid )
);

CREATE TABLE ehr.site_module_properties
(
  prop_name varchar(255) NOT NULL DEFAULT NULL,
  stringvalue varchar(255) DEFAULT NULL,
  floatvalue double precision,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,
  CONSTRAINT pk_site_module_properties PRIMARY KEY (prop_name )
);

CREATE TABLE ehr.snomed_tags
(
  rowid INT IDENTITY(1,1) NOT NULL,
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  recordid varchar(200),
  code varchar(32),
  CONSTRAINT pk_snomed_tags PRIMARY KEY (rowid )
);

CREATE TABLE ehr.supplemental_pedigree
(
  rowid INT IDENTITY(1,1) NOT NULL,
  id varchar(50) NOT NULL,
  gender varchar(50),
  dam varchar(50),
  sire varchar(50),
  birth datetime,
  acquiredate datetime,
  departdate datetime,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,
  container entityid,
  CONSTRAINT pk_supplemental_pedigree PRIMARY KEY (rowid )
);

--note: field lengths altered
CREATE TABLE ehr.tasks
(
  taskid entityid NOT NULL,
  rowid INT IDENTITY(1,1) NOT NULL,
  category varchar(200) NOT NULL,
  title varchar(200),
  formtype varchar(200),
  qcstate integer,
  assignedto userid,
  duedate datetime,
  requestid entityid,
  container entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime,
  modifiedby userid NOT NULL,
  modified datetime,
  description text,
  datecompleted datetime,
  CONSTRAINT pk_tasks PRIMARY KEY (taskid )
);


insert into ehr.notificationtypes (notificationtype,description) VALUES ('Admin Alerts', 'An email will be sent daily to summarize site usage, client errors, etc.');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Animal Death', 'An email will be sent each time an animal is marked as dead');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Blood Admin Alerts', 'An email will be sent daily to summarize the blood schedule and problems with it.');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Blood Alerts', 'An email will be sent 3X daily to summarize completed and scheduled blood draws.');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Blood Draw Request Completed', 'An email will be sent each time a blood draw request is completed');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Blood Draw Request Denied', 'An email will be sent each time a blood draw request is denied');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Clinpath Abnormal Results', 'An email will be sent periodically to summarize abnormal clinpath results');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Clinpath Admin Alerts', 'A daily email will be sent to summarize clinpath requests');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Clinpath Request Completed', 'An email will be sent each time a clinpath request is completed');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Clinpath Request Denied', 'An email will be sent each time a clinpath request is denied');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Clinpath Request - Stat', 'An email will be sent each time a clinpath request is submitted with a "Stat" priority.');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Clinpath Results', 'A daily email will be sent to summarize finalized clinpath results');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Colony Alerts', 'An email will be sent daily to summarize many aspects of the colony, focused on data validation.');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Colony Alerts Lite', 'An hourly email will be mailed if any data problems are identified, such as double housing.');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Colony Management Alerts', 'An email will be sent daily to summarize information related to colony management and housing.');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Incomplete Treatments', 'An email will be sent 3-4X per day to summarize incomplete treatments');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Overdue Weight Alerts', 'An email will be sent daily to summarize animals overdue for weights.');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Prenatal Death', 'An email will be sent each time a prenatal death is reported');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Site Error Alerts', 'An hourly email will be sent if a new site error is reported.');
insert into ehr.notificationtypes (notificationtype,description) VALUES ('Weight Drops', 'An email will be sent daily to summarize weight drops in the last 3 days');

INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Completed', 0, 0, 0, 0);
INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('In Progress', 1, 0, 0, 1);
INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Abnormal', 0, 0, 0, 0);
INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Review Required', 1, 0, 0, 1);
INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Pending', 0, 0, 1, 1);
INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Delete Requested', 0, 0, 0, 1);
INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Denied', 0, 0, 1, 1);
INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Approved', 1, 0, 1, 1);
INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Scheduled', 1, 0, 0, 1);

/* EHR-11.36-11.37.sql */

CREATE TABLE ehr.status
(
  rowid int identity(1,1) NOT NULL,
  label varchar(200) NOT NULL,
  description varchar(4000),
  publicdata bit DEFAULT 0,
  draftdata bit DEFAULT 0,
  isdeleted bit DEFAULT 0,
  isrequest bit DEFAULT 0,
  allowfuturedates bit DEFAULT 0,
  CONSTRAINT pk_status PRIMARY KEY (rowid)
);

INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Completed', 'Record has been completed and is public', 1, 0, 0, 0, 0);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('In Progress', 'Draft Record, not public', 0, 1, 0, 0, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Abnormal', 'Value is abnormal', 1, 0, 0, 0, 0);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Review Required', 'Review is required prior to public release', 0, 1, 0, 0, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Pending', 'Part of a request that has not been approved', 0, 0, 0, 1, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Delete Requested', 'Records are requested to be deleted', 0, 0, 0, 0, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Denied', 'Request has been denied', 0, 0, 0, 1, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Approved', 'Request has been approved', 0, 1, 0, 1, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Scheduled', 'Record is scheduled, but not performed', 0, 1, 0, 0, 1);


--drop table ehr.qcstatemetadata;

/* EHR-12.20-12.30.sql */

/* EHR-12.21-12.22.sql */

CREATE TABLE ehr.chargedItems (
    rowid INT IDENTITY (1,1) NOT NULL,
    id varchar(100),
    date DATETIME,
    debitedaccount varchar(100),
    creditedaccount varchar(100),
    category varchar(100),
    item varchar(500),
    quantity double precision,
    unitcost double precision,
    totalcost double precision,
    comment varchar(4000),
    flag integer,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created DATETIME,
    modifiedBy USERID,
    modified DATETIME,

    CONSTRAINT PK_charged_items PRIMARY KEY (RowId)
);

ALTER TABLE ehr.snomed_tags ADD schemaName varchar(100);
ALTER TABLE ehr.snomed_tags ADD queryName varchar(100);
ALTER TABLE ehr.snomed_tags ADD qualifier varchar(200);
ALTER TABLE ehr.snomed_tags ADD sort integer;

CREATE TABLE ehr.accounts (
    account varchar(100),
    "grant" varchar(100),
    investigator integer,
    startdate DATETIME,
    enddate DATETIME,
    externalid varchar(200),
    comment varchar(4000),
    tier integer,

    createdBy USERID,
    created DATETIME,
    modifiedBy USERID,
    modified DATETIME,

    CONSTRAINT PK_accounts PRIMARY KEY (account)
);

CREATE TABLE ehr.investigators (
    RowId  int identity(1,1) NOT NULL,
    FirstName varchar(100),
    LastName varchar(100),
    Position varchar(100),
    Address varchar(500),
    City varchar(100),
    State varchar(100),
    Country varchar(100),
    ZIP integer,
    PhoneNumber varchar(100),
    InvestigatorType varchar(100),
    EmailAddress varchar(100),
    DateCreated datetime,
    DateDisabled datetime,
    Division varchar(100),

    --container entityid,
    createdby userid,
    created datetime,
    modifiedby userid,
    modified datetime,
    CONSTRAINT pk_investigators PRIMARY KEY (rowid)
);

/* EHR-12.22-12.23.sql */

--user / role for a given procedure
CREATE TABLE ehr.encounter_participants (
  rowid int identity(1,1),
  userid int,
  username varchar(500),
  role varchar(200),
  procedure_id entityid,
  comment varchar(4000),
  container entityid NOT NULL,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,

  constraint pk_encounter_participants PRIMARY KEY (rowid)
);


ALTER TABLE ehr.protocol add enddate datetime;
ALTER TABLE ehr.protocol add title varchar(1000);
ALTER TABLE ehr.protocol add usda_level varchar(100);
ALTER TABLE ehr.protocol add external_id varchar(200);
ALTER TABLE ehr.protocol add project_type varchar(200);
ALTER TABLE ehr.protocol add ibc_approval_required bit;
ALTER TABLE ehr.protocol add ibc_approval_num varchar(200);

ALTER table ehr.project drop column requestid;

/* EHR-12.23-12.24.sql */

-- Call to Java upgrade code no longer needed

/* EHR-12.26-12.27.sql */

DROP table ehr.site_module_properties;
DROP table ehr.automatic_alerts;

/* EHR-12.27-12.28.sql */

ALTER TABLE ehr.animal_groups add category varchar(100);
ALTER TABLE ehr.animal_groups drop column container;

CREATE TABLE ehr.animal_group_members (
  rowid int identity(1,1),
  date datetime,
  enddate datetime,
  groupname integer,
  comment varchar(4000),

  objectid entityid,
  container entityid NOT NULL,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,

  constraint pk_animal_group_members PRIMARY KEY (rowid)
);

CREATE TABLE ehr.scheduled_tasks (
  rowid int identity(1,1),
  taskid ENTITYID NOT NULL,
  tasktype varchar(200),
  date datetime,
  enddate datetime,
  frequency int,
  id varchar(100),
  location varchar(100),
  description varchar(4000),
  json text,

  objectid entityid,
  container entityid NOT NULL,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,

  constraint pk_scheduled_tasks PRIMARY KEY (rowid)
);

CREATE TABLE ehr.scheduled_task_types (
  tasktype varchar(200),

  constraint pk_scheduled_task_types PRIMARY KEY (tasktype)
);

ALTER TABLE ehr.encounter_participants add objectid ENTITYID;

/* EHR-12.28-12.29.sql */

ALTER TABLE ehr.project add contact_emails varchar(4000);
ALTER TABLE ehr.project DROP COLUMN qcstate;

/* EHR-12.30-12.301.sql */

ALTER TABLE ehr.snomed_tags ADD objectid ENTITYID;

/* EHR-12.301-12.302.sql */

ALTER TABLE ehr.protocolProcedures ADD startdate datetime;
ALTER TABLE ehr.protocolProcedures ADD enddate datetime;
ALTER TABLE ehr.protocolProcedures ADD objectid entityid;

CREATE TABLE ehr.encounter_flags (
  rowid int identity(1,1),
  id varchar(100),
  date datetime,
  parentid entityid,
  schemaName varchar(100),
  queryName varchar(100),
  flag varchar(200),
  value varchar(100),
  remark varchar(4000),

  objectid entityid,
  container entityid NOT NULL,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,

  constraint pk_encounter_flags PRIMARY KEY (rowid)
);

CREATE TABLE ehr.encounter_summaries (
  rowid int identity(1,1),
  id varchar(100),
  date datetime,
  parentid entityid,
  schemaName varchar(100),
  queryName varchar(100),
  remark text,

  objectid entityid,
  container entityid NOT NULL,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,

  constraint pk_encounter_summaries PRIMARY KEY (rowid)
);

alter table ehr.project add startdate datetime;
alter table ehr.project add enddate datetime;
alter table ehr.project add inves2 varchar(200);

alter table ehr.accounts add objectid entityid;
alter table ehr.accounts add active bit default 1;
alter table ehr.accounts add fiscalAuthority varchar(200);

drop table ehr.chargedItems;

CREATE TABLE ehr.projectAccountHistory (
  rowid int identity(1,1),
  project int,
  account varchar(200),
  startdate datetime,
  enddate datetime,
  objectid entityid,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime
);

/* EHR-12.302-12.303.sql */

ALTER TABLE ehr.tasks ADD billingType int;

alter table ehr.project add name varchar(100);
alter table ehr.project add investigatorId int;

alter table ehr.protocol add investigatorId int;

/* EHR-12.303-12.304.sql */

DROP TABLE ehr.investigators;
DROP TABLE ehr.accounts;

/* EHR-12.304-12.305.sql */

DROP TABLE ehr.projectAccountHistory;

/* EHR-12.315-12.316.sql */

ALTER TABLE ehr.snomed_tags ADD set_number int default 1;
go
update ehr.snomed_tags set set_number = 1 where set_number is null;

/* EHR-12.316-12.317.sql */

ALTER TABLE ehr.encounter_participants DROP COLUMN procedure_id;
ALTER TABLE ehr.encounter_participants ADD parentid entityid;

go

CREATE INDEX encounter_flags_objectid ON ehr.encounter_flags (objectid);

CREATE INDEX encounter_flags_parentid ON ehr.encounter_flags (parentid);

CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);

CREATE INDEX encounter_participants_parentid ON ehr.encounter_participants (parentid);

CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);

CREATE INDEX encounter_summaries_parentid ON ehr.encounter_summaries (parentid);

CREATE INDEX snomed_tags_objectid ON ehr.snomed_tags (objectid);

CREATE INDEX snomed_tags_recordid ON ehr.snomed_tags (recordid);

/* EHR-12.317-12.318.sql */

ALTER TABLE ehr.protocol ADD last_modification datetime;

/* EHR-12.321-12.322.sql */

ALTER TABLE ehr.protocol_counts add project integer;
ALTER TABLE ehr.protocol_counts add start datetime;
ALTER TABLE ehr.protocol_counts add enddate datetime;
ALTER TABLE ehr.protocol_counts add gender varchar(100);

ALTER TABLE ehr.protocol add first_approval datetime;

ALTER TABLE ehr.protocolProcedures add project integer;
ALTER TABLE ehr.protocolProcedures add daysBetween integer;

/* EHR-12.322-12.323.sql */

ALTER TABLE ehr.encounter_participants add Id varchar(100);

ALTER TABLE ehr.snomed_tags ADD Id varchar(100);
ALTER TABLE ehr.snomed_tags ADD caseid entityid;
ALTER TABLE ehr.snomed_tags ADD parentid entityid;

GO
CREATE INDEX encounter_flags_id ON ehr.encounter_flags (id);
CREATE INDEX encounter_encounter_participants_id ON ehr.encounter_participants (id);
CREATE INDEX encounter_summaries_id ON ehr.encounter_summaries (id);
CREATE INDEX snomed_tags_id ON ehr.snomed_tags (id);
CREATE INDEX snomed_tags_parentid ON ehr.snomed_tags (parentid);
CREATE INDEX snomed_tags_caseid ON ehr.snomed_tags (caseid);

/* EHR-12.324-12.325.sql */

DROP INDEX snomed_tags_objectid ON ehr.snomed_tags;
ALTER TABLE ehr.snomed_tags ALTER COLUMN objectid varchar(50);
CREATE INDEX snomed_tags_objectid ON ehr.snomed_tags (objectid);

DROP INDEX encounter_flags_objectid ON ehr.encounter_flags;
ALTER TABLE ehr.encounter_flags ALTER COLUMN objectid varchar(50);
CREATE INDEX encounter_flags_objectid ON ehr.encounter_flags (objectid);

DROP INDEX encounter_participants_objectid ON ehr.encounter_participants;
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid varchar(50);
CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);

DROP INDEX encounter_summaries_objectid ON ehr.encounter_summaries;
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid varchar(50);
CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);

/* EHR-12.325-12.326.sql */

DROP INDEX snomed_tags_objectid ON ehr.snomed_tags;
ALTER TABLE ehr.snomed_tags ALTER COLUMN objectid varchar(60);
CREATE INDEX snomed_tags_objectid ON ehr.snomed_tags (objectid);

DROP INDEX encounter_flags_objectid ON ehr.encounter_flags;
ALTER TABLE ehr.encounter_flags ALTER COLUMN objectid varchar(60);
CREATE INDEX encounter_flags_objectid ON ehr.encounter_flags (objectid);

DROP INDEX encounter_participants_objectid ON ehr.encounter_participants;
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid varchar(60);
CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);

DROP INDEX encounter_summaries_objectid ON ehr.encounter_summaries;
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid varchar(60);
CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);

/* EHR-12.327-12.328.sql */

ALTER TABLE ehr.animal_groups ADD container entityid;
ALTER TABLE ehr.animal_groups ADD date datetime;
ALTER TABLE ehr.animal_groups ADD enddate datetime;
ALTER TABLE ehr.animal_groups ADD objectid entityid;
ALTER TABLE ehr.animal_groups ADD purpose varchar(4000);
ALTER TABLE ehr.animal_groups ADD comment text;

ALTER TABLE ehr.animal_group_members ADD id varchar(200);

ALTER TABLE ehr.animal_group_members DROP COLUMN groupname;
ALTER TABLE ehr.animal_group_members ADD groupId int;

/* EHR-12.329-12.330.sql */

DROP INDEX encounter_encounter_participants_id ON ehr.encounter_participants;
CREATE INDEX encounter_participants_id ON ehr.encounter_participants (id);

/* EHR-12.330-12.331.sql */

ALTER TABLE ehr.protocol_counts ADD objectid entityid;

/* EHR-12.331-12.332.sql */

--remove not null constraint
alter table ehr.protocol_counts alter column protocol varchar(200) null;

/* EHR-12.332-12.333.sql */

CREATE INDEX snomed_tags_id_recordid ON ehr.snomed_tags (id, recordid);

/* EHR-12.334-12.335.sql */

DROP INDEX snomed_tags_id_recordid ON ehr.snomed_tags;

CREATE INDEX snomed_tags_id_recordid_code on ehr.snomed_tags (id, recordid, code);

/* EHR-12.335-12.336.sql */

;

/* EHR-12.341-12.342.sql */

alter table ehr.project add use_category varchar(100);

/* EHR-12.342-12.343.sql */

CREATE INDEX animal_group_members_groupId_container ON ehr.animal_group_members (groupId, container);

--NOTE: this is different than the SQLServer version
CREATE INDEX project_investigatorid_project ON ehr.project (investigatorId ASC, project ASC) INCLUDE (name);

/* EHR-12.343-12.344.sql */

CREATE INDEX encounter_participants_container_rowid_id ON ehr.encounter_participants (container, rowid, id);
CREATE INDEX encounter_participants_container_rowid_parentid ON ehr.encounter_participants (container, rowid, parentid);

CREATE INDEX encounter_summaries_parentid_rowid_container_id ON ehr.encounter_summaries (parentid, rowid, container, id);
CREATE INDEX encounter_summaries_container_rowid ON ehr.encounter_summaries (container, rowid);
CREATE INDEX encounter_summaries_container_parentid ON ehr.encounter_summaries (container, parentid);

CREATE INDEX snomed_tags_recordid_rowid_id ON ehr.snomed_tags (recordid, rowid, id);
CREATE INDEX snomed_tags_code_rowid_id_recordid ON ehr.snomed_tags (code, rowid, id, recordid);

/* EHR-12.344-12.345.sql */

CREATE INDEX snomed_tags_recordid_container_code ON ehr.snomed_tags (recordid, container, code);

/* EHR-12.345-12.346.sql */

CREATE TABLE ehr.treatment_times (
  rowid int identity(1,1),
  treatmentid entityid,
  time int,

  objectid entityid,
  container entityid,
  created datetime,
  createdby int,
  modified datetime,
  modifiedby int,

  constraint PK_teatment_times PRIMARY KEY (rowid)
);

/* EHR-12.346-12.347.sql */

CREATE INDEX project_name_project ON ehr.project (name, project);

CREATE INDEX snomed_tags_code_container ON ehr.snomed_tags (code, container);

/* EHR-12.350-12.351.sql */

--NOTE: this change is not applied to postgres
ALTER TABLE ehr.snomed_tags DROP PK_snomed_tags;
ALTER TABLE ehr.snomed_tags ADD CONSTRAINT PK_snomed_tags PRIMARY KEY NONCLUSTERED (rowid);

CREATE CLUSTERED INDEX CIDX_snomed_tags ON
  ehr.snomed_tags (container, recordid, set_number, sort)
  --NOTE: free versions of SQLServer do not support compression, so we cannot add this in the upgrade script.
  --WITH (DATA_COMPRESSION = ROW);

/* EHR-12.355-12.356.sql */

ALTER TABLE ehr.requests ADD sendemail bit;
ALTER TABLE ehr.reports ADD subjectIdFieldName varchar(200);

/* EHR-12.356-12.357.sql */

ALTER TABLE ehr.project ADD alwaysavailable bit;

/* EHR-12.358-12.359.sql */

INSERT INTO ehr.qcstateMetadata (QCStateLabel,draftData,isDeleted,isRequest)
VALUES ('Request: Sample Delivered', 1, 0, 1);

/* EHR-12.359-12.360.sql */

CREATE TABLE ehr.protocolexemptions(
  rowid int identity(1,1),
  protocol VARCHAR(100),
  project INTEGER,
  exemption VARCHAR(200),
  startdate DATETIME,
  enddate DATETIME,
  remark VARCHAR(4000),

  container ENTITYID,
  createdby INTEGER,
  created DATETIME ,
  modifiedby INTEGER,
  modified DATETIME,

  CONSTRAINT PK_protocolExemptions PRIMARY KEY (rowid)
);

/* EHR-12.361-12.362.sql */

ALTER TABLE ehr.snomed_tags ADD taskid entityid;

/* EHR-12.362-12.363.sql */

ALTER TABLE ehr.encounter_participants ADD taskid entityid;

/* EHR-12.363-12.364.sql */

truncate table ehr.encounter_participants;

--this might have been created by EHRManager
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'index', 'encounter_participants_objectid';
GO
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid ENTITYID NOT NULL;
GO
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'constraint', 'pk_encounter_participants';

ALTER TABLE ehr.encounter_participants ADD CONSTRAINT pk_encounter_participants PRIMARY KEY (objectid);
GO
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'index', 'encounter_participants_container_rowid_id';
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'index', 'encounter_participants_container_rowid_parentid';
GO


ALTER TABLE ehr.encounter_participants DROP COLUMN rowid;

/* EHR-12.364-12.365.sql */

--this might have been created by EHRManager
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'index', 'encounter_participants_objectid';
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'CONSTRAINT', 'PK_encounter_participants';

GO
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid VARCHAR(60) NOT NULL;
GO

ALTER TABLE ehr.encounter_participants ADD CONSTRAINT pk_encounter_participants PRIMARY KEY (objectid);

/* EHR-12.371-12.372.sql */

ALTER TABLE ehr.project ADD shortname varchar(200);

/* EHR-12.372-12.373.sql */

--this might have been created by EHRManager
EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'index', 'encounter_summaries_objectid';
EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'index', 'encounter_summaries_parentid_rowid_container_id';
EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'index', 'encounter_summaries_container_rowid';
EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'constraint', 'PK_encounter_summaries';
GO

ALTER TABLE ehr.encounter_summaries ADD taskid entityid;
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid VARCHAR(60) NOT NULL;
GO
ALTER TABLE ehr.encounter_summaries ADD CONSTRAINT PK_encounter_summaries PRIMARY KEY (objectid);
GO
ALTER TABLE ehr.encounter_summaries DROP COLUMN rowid;

/* EHR-12.373-12.374.sql */

CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);
CREATE INDEX encounter_summaries_parentid_objectid_container_id ON ehr.encounter_summaries (parentid, objectid, container, id);
CREATE INDEX encounter_summaries_container_objectid ON ehr.encounter_summaries (container, objectid);

CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);
CREATE INDEX encounter_participants_taskid ON ehr.encounter_participants (taskid);

CREATE INDEX snomed_tags_taskid ON ehr.snomed_tags (taskid);

/* EHR-12.374-12.375.sql */

CREATE INDEX treatment_times_container_treatmentid ON ehr.treatment_times (container, treatmentid);

/* EHR-12.376-12.377.sql */

INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Cancelled', 0, 0, 1, 1);

/* EHR-12.378-12.379.sql */

ALTER TABLE ehr.project ADD projecttype varchar(100);

/* EHR-12.379-12.380.sql */

ALTER TABLE ehr.formtemplates ADD category varchar(100);

/* EHR-12.381-12.382.sql */

ALTER TABLE ehr.formtemplates drop column template;
ALTER TABLE ehr.formtemplaterecords ADD targettemplate varchar(100);

/* EHR-12.384-12.385.sql */

ALTER TABLE ehr.snomed_tags DROP PK_snomed_tags;
DROP INDEX snomed_tags_recordid_rowid_id ON ehr.snomed_tags;
DROP INDEX snomed_tags_code_rowid_id_recordid ON ehr.snomed_tags;
DROP INDEX snomed_tags_parentid ON ehr.snomed_tags;
DROP INDEX snomed_tags_caseid ON ehr.snomed_tags;
DROP INDEX snomed_tags_objectid on ehr.snomed_tags;

GO
ALTER TABLE ehr.snomed_tags DROP COLUMN rowid;
ALTER TABLE ehr.snomed_tags DROP COLUMN parentid;
ALTER TABLE ehr.snomed_tags DROP COLUMN caseid;
ALTER TABLE ehr.snomed_tags DROP COLUMN schemaName;
ALTER TABLE ehr.snomed_tags DROP COLUMN queryName;
ALTER TABLE ehr.snomed_tags ALTER COLUMN objectid varchar(60) NOT NULL;
GO
CREATE INDEX snomed_tags_objectid on ehr.snomed_tags (objectid);
ALTER TABLE ehr.snomed_tags ADD CONSTRAINT PK_snomed_tags PRIMARY KEY NONCLUSTERED (objectid);

/* EHR-12.385-12.386.sql */

--removed after monitoring usage on site
DROP INDEX encounter_summaries_parentid ON ehr.encounter_summaries;
DROP INDEX encounter_summaries_parentid_objectid_container_id ON ehr.encounter_summaries;
DROP INDEX encounter_summaries_objectid ON ehr.encounter_summaries;

CREATE INDEX encounter_summaries_taskid ON ehr.encounter_summaries (taskid);

DROP INDEX encounter_participants_objectid ON ehr.encounter_participants;

DROP INDEX snomed_tags_id_recordid_code ON ehr.snomed_tags;
DROP INDEX snomed_tags_id ON ehr.snomed_tags;
DROP INDEX snomed_tags_recordid ON ehr.snomed_tags;
DROP INDEX snomed_tags_recordid_container_code ON ehr.snomed_tags;

/* EHR-12.386-12.387.sql */

DROP INDEX snomed_tags_objectid ON ehr.snomed_tags;

/* EHR-12.387-12.388.sql */

ALTER TABLE ehr.encounter_summaries ADD category varchar(100);

/* EHR-12.388-12.389.sql */

ALTER TABLE ehr.snomed_tags ADD parentid entityid;

/* EHR-12.393-12.394.sql */

ALTER TABLE ehr.project ADD container entityid;
ALTER TABLE ehr.protocol ADD container entityid;
GO
--upgrade path for WNPRC
UPDATE ehr.project SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'WNPRC');
UPDATE ehr.protocol SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'WNPRC');

--this will upgrade ONPRC, since the query above will leave all records NULL
UPDATE ehr.project SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'ONPRC') WHERE container IS NULL;
UPDATE ehr.protocol SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'ONPRC') WHERE container IS NULL;

--this will delete any other pre-existing records lacking a container.  the result should be to give WNPRC an upgrade, but truncate any team city agents
DELETE FROM ehr.project WHERE container IS NULL;
DELETE FROM ehr.protocol WHERE container IS NULL;

/* EHR-12.394-12.395.sql */

ALTER TABLE ehr.project DROP PK_project;
ALTER TABLE ehr.protocol DROP PK_protocol;
GO
ALTER TABLE ehr.project ADD objectid ENTITYID NOT NULL DEFAULT newid();
ALTER TABLE ehr.protocol ADD objectid ENTITYID NOT NULL DEFAULT newid();
GO
ALTER TABLE ehr.project ADD CONSTRAINT PK_project PRIMARY KEY (objectid);
ALTER TABLE ehr.protocol ADD CONSTRAINT PK_protocol PRIMARY KEY (objectid);

/* EHR-12.395-12.396.sql */

--placeholder for pg changes
;

/* EHR-12.397-12.398.sql */

CREATE INDEX IDX_project_container_project_protocol ON ehr.project (container, project, protocol);
CREATE INDEX IDX_project_container_project_investigatorid ON ehr.project (container, project, investigatorid);
CREATE INDEX IDX_protocol_container_protocol ON ehr.protocol (container, protocol);

CREATE INDEX IDX_container_taskid_formtype ON ehr.tasks (container, taskid, formtype);

/* EHR-12.399-12.400.sql */

ALTER TABLE ehr.animal_group_members ADD releaseType VARCHAR(200);
ALTER TABLE ehr.animal_group_members ADD taskid entityid;
ALTER TABLE ehr.animal_group_members ADD qcstate integer;

/* EHR-12.400-12.401.sql */

ALTER TABLE ehr.animal_group_members DROP pk_animal_group_members;
ALTER TABLE ehr.animal_group_members DROP COLUMN rowid;
ALTER TABLE ehr.animal_group_members DROP COLUMN comment;
ALTER TABLE ehr.animal_group_members ADD remark varchar(4000);
ALTER TABLE ehr.animal_group_members ALTER COLUMN objectid entityid NOT NULL;
GO
ALTER TABLE ehr.animal_group_members ADD CONSTRAINT pk_animal_group_members PRIMARY KEY (objectid);

/* EHR-12.402-12.403.sql */

ALTER TABLE ehr.snomed_tags ADD formsort integer;
ALTER TABLE ehr.snomed_tags ADD date timestamp;
ALTER TABLE ehr.encounter_summaries ADD formsort integer;
ALTER TABLE ehr.encounter_participants ADD formsort integer;

ALTER TABLE ehr.formtemplates ADD hidden bit default 0;
GO
UPDATE ehr.formtemplates SET hidden = 0;

/* EHR-12.403-12.404.sql */

ALTER TABLE ehr.snomed_tags DROP COLUMN date;
GO
ALTER TABLE ehr.snomed_tags ADD date datetime;

/* EHR-12.404-12.405.sql */

alter table ehr.kinship alter column coefficient double precision;

/* EHR-12.409-12.410.sql */

CREATE INDEX IDX_requests_requestid_container ON ehr.requests (requestid, container);
CREATE INDEX IDX_container_project_objectid_name ON ehr.project (container, project, objectid, name);

--stats, sql server only
CREATE STATISTICS STATS_project_objectid_container_project ON ehr.project (objectid, container, project);
CREATE STATISTICS STATS_project_project_objectid ON ehr.project (project, objectid);

/* EHR-12.415-12.416.sql */

ALTER TABLE ehr.protocol ADD lastAnnualReview datetime;

/* EHR-12.416-12.417.sql */

ALTER TABLE ehr.protocol_counts ADD description varchar(4000);

/* EHR-12.417-12.418.sql */

DROP INDEX encounter_flags_objectid on ehr.encounter_flags;
DROP INDEX encounter_flags_parentid on ehr.encounter_flags;

/* EHR-12.418-12.419.sql */

ALTER TABLE ehr.formtemplates DROP CONSTRAINT UNIQUE_formTemplates;

ALTER TABLE ehr.formtemplates ADD CONSTRAINT UNIQUE_formTemplates UNIQUE (container, formtype, title);

/* EHR-12.419-12.420.sql */

UPDATE ehr.qcStateMetadata SET draftData = 1 WHERE QCStateLabel = 'Review Required';

/* EHR-12.421-12.422.sql */

CREATE INDEX IDX_treatment_times_treatmentid ON ehr.treatment_times (treatmentid);

/* EHR-12.424-12.425.sql */
GO

CREATE PROCEDURE ehr.handleUpgrade AS
    BEGIN
    IF NOT EXISTS(SELECT column_name
            FROM information_schema.columns
            WHERE table_name='protocolprocedures' and table_schema='ehr' and column_name='remark')
        BEGIN
        -- Run variants of scripts from onprc14.2 branch
        ALTER TABLE [ehr].[protocolprocedures] add remark varchar(max);
        END
    END;
GO

EXEC ehr.handleUpgrade
GO

DROP PROCEDURE ehr.handleUpgrade
GO

EXEC core.fn_dropifexists 'treatment_times', 'ehr', 'Index', 'IDX_treatment_times_treatmentid';

CREATE INDEX IDX_treatment_times_treatmentid ON ehr.treatment_times (treatmentid);

/* EHR-12.425-12.426.sql */

ALTER TABLE ehr.project ALTER COLUMN Title VARCHAR(400);