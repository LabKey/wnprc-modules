/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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