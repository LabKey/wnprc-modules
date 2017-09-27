/*
 * Copyright (c) 2011-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/* EHR-11.10-11.20.sql */

/* EHR-11.10-11.101.sql */

CREATE SCHEMA ehr;

CREATE OR REPLACE FUNCTION ehr.uuid()
 RETURNS uuid AS
$BODY$
 SELECT CAST(md5(current_database()|| user ||current_timestamp
||random()) as uuid)
$BODY$
 LANGUAGE 'sql' VOLATILE
;


DROP TABLE IF EXISTS ehr.module_properties;
CREATE TABLE ehr.module_properties (
    RowId SERIAL NOT NULL,

    prop_name varchar(255) DEFAULT NULL,
    stringvalue varchar(255) DEFAULT NULL,
    floatvalue float DEFAULT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_module_properties PRIMARY KEY (RowId)
);

DROP TABLE IF EXISTS ehr.snomed_tags;
CREATE TABLE ehr.snomed_tags
(
    RowId SERIAL NOT NULL,
    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    recordId character varying(200),
    code character varying(32),

    CONSTRAINT PK_snomed_tags PRIMARY KEY (RowId)
);

DROP TABLE IF EXISTS ehr.tasks;
CREATE TABLE ehr.tasks
(
    TaskId ENTITYID NOT NULL,
    RowId SERIAL NOT NULL,
    category varchar(200) not null,
    title varchar(4000),
    FormType character varying(200),
    QCState integer,
    AssignedTo USERID,
    DueDate TIMESTAMP,
    RequestId ENTITYID,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    Description TEXT,

    CONSTRAINT PK_tasks PRIMARY KEY (TaskId)

);


DROP TABLE IF EXISTS ehr.requests;
CREATE TABLE ehr.requests
(
    RequestId ENTITYID NOT NULL,
    RowId SERIAL NOT NULL,
    --DueDate TIMESTAMP,
    title varchar(4000),
    FormType character varying(200),

    priority varchar(200),
    notify1 integer,
    notify2 integer,
    pi varchar(200),
    QCState integer,
    Description text,
    daterequested timestamp,
    enddate timestamp,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_requests PRIMARY KEY (RequestId)
);


DROP TABLE IF EXISTS ehr.cage_observations;
CREATE TABLE ehr.cage_observations
(
    RowId serial NOT NULL,

    date TIMESTAMP not null,
    Roomcage character varying(100),
    room character varying(100),
    cage character varying(100),
    remark TEXT,
    userid character varying(100),
    ObjectId ENTITYID,

    taskid ENTITYID,
    parentid ENTITYID,
    QCState integer,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    Description TEXT,

    CONSTRAINT PK_cage_observations PRIMARY KEY (RowId)

);


-- ----------------------------
-- Table structure for ehr.reports
-- ----------------------------
DROP TABLE IF EXISTS ehr.reports;
CREATE TABLE ehr.reports (
rowid serial not null,
ReportName varchar(255) DEFAULT NULL,
Category varchar(255) DEFAULT NULL,
ReportType varchar(255) DEFAULT NULL,
ReportTitle varchar(255) DEFAULT NULL,
Visible bool DEFAULT NULL,
ContainerPath varchar(255) DEFAULT NULL,
SchemaName varchar(255) DEFAULT NULL,
QueryName varchar(255) DEFAULT NULL,
ViewName varchar(255) DEFAULT NULL,
Report varchar(255) DEFAULT NULL,
DateFieldName varchar(255) DEFAULT NULL,
TodayOnly bool DEFAULT NULL,
QueryHasLocation bool DEFAULT NULL,

Container ENTITYID NOT NULL,
CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_reports PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;

DROP TABLE IF EXISTS ehr.extracts;
CREATE TABLE ehr.extracts
(
    RowId serial NOT NULL,
    queryName character varying(100),
    schemaName character varying(100),
    containerPath character varying(100),
    viewName character varying(100),
    fileName character varying(100),
    columns character varying(500),
    fieldsToHash character varying(500),

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_extracts PRIMARY KEY (RowId)

);


DROP TABLE IF EXISTS ehr.formTemplates;
CREATE TABLE ehr.formTemplates
(
    entityId ENTITYID not null,
    Title varchar(4000) not null,
    formType varchar(4000) not null,
    template varchar(4000),
    userId integer default null,
    description text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_formTemplates PRIMARY KEY (entityId),
    CONSTRAINT UNIQUE_formTemplates UNIQUE (formtype, title)
);


DROP TABLE IF EXISTS ehr.formTemplateRecords;
CREATE TABLE ehr.formTemplateRecords
(
    RowId serial NOT NULL,
    TemplateId ENTITYID not null,
    StoreId varchar(4000) not null,
    json text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_formTemplateRecords PRIMARY KEY (RowId)
);


DROP TABLE IF EXISTS ehr.formTypes;
CREATE TABLE ehr.formTypes
(
    formType varchar(4000) NOT NULL,
    category varchar (100),
    description text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_formTypes PRIMARY KEY (formType)
);


DROP TABLE IF EXISTS ehr.formPanelSections;
CREATE TABLE ehr.formPanelSections
(
    RowId serial NOT NULL,
    formType varchar(4000) not null,
    Destination varchar(4000) not null,
    sort_order int4,
    xtype varchar(200) not null,
    schemaName varchar(200),
    queryName varchar(200),
    title varchar(4000),
    metadataSources varchar(4000),
    buttons varchar(4000),
    initialTemplates varchar(4000),
    configJson text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_formPanelSections PRIMARY KEY (RowId)
);

-- DROP TABLE IF EXISTS ehr.taskPanelSectionMapping;
-- CREATE TABLE ehr.taskPanelSectionMapping
-- (
--     RowId serial NOT NULL,
--     FormType varchar(4000) not null,
--     SectionId int4,
--     Destination varchar(4000) not null,
--     sort_order int4,
--
--     Container ENTITYID NOT NULL,
--     CreatedBy USERID NOT NULL,
--     Created TIMESTAMP NOT NULL,
--     ModifiedBy USERID NOT NULL,
--     Modified TIMESTAMP NOT NULL,
--
--      CONSTRAINT PK_taskPanelSectionMapping PRIMARY KEY (RowId)
-- );


DROP TABLE IF EXISTS ehr.notificationTypes;
CREATE TABLE ehr.notificationTypes
(
    NotificationType varchar(4000) NOT NULL,
    description text,

    CONSTRAINT PK_notificationTypes PRIMARY KEY (NotificationType)
);

INSERT into ehr.notificationTypes
(NotificationType, description)
VALUES
('Clinpath Service Request', ''),
('Pathology Service Request', ''),
('SPI Service Request', ''),
('Animal Care Service Request', ''),
('Colony Validation - General', 'Subscribing to this notification will result in emails for general colony records issues like records needing attention, animals missing from the demographics table, etc.')
;

DROP TABLE IF EXISTS ehr.notificationRecipients;
CREATE TABLE ehr.notificationRecipients
(
    RowId serial NOT NULL,
    NotificationType varchar(4000),
    Recipient varchar(4000) not null,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_notificationRecipients PRIMARY KEY (RowId)
);


--/////////////////////////////////////

DROP TABLE IF EXISTS ehr.protocols;
CREATE TABLE ehr.protocols
(
    protocol varchar(4000) NOT NULL,
    inves varchar(200),
    approve TIMESTAMP,
    description text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_protocol PRIMARY KEY (protocol)
);

DROP TABLE IF EXISTS ehr.protocol_counts;
CREATE TABLE ehr.protocol_counts
(
    rowId serial not null,
    protocol varchar(4000) NOT NULL,
    species varchar (200) not null,
    allowed integer not null,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_protocol_counts PRIMARY KEY (RowId)
);

DROP TABLE IF EXISTS ehr.project;
CREATE TABLE ehr.project
(
    project varchar (200) not null,
    protocol varchar(200) NOT NULL,
    account varchar(200),
    inves varchar(4000),
    avail varchar(100),
    title varchar(4000),
    research boolean,
    reqname varchar(4000),
    requestId varchar(100),
    QCState integer,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_project PRIMARY KEY (project)
);

-- DROP TABLE IF EXISTS ehr.error_reports;
-- CREATE TABLE ehr.error_reports
-- (
--     id varchar (4000) not null,
--     protocol varchar(200) NOT NULL,
--     account varchar(200),
--     inves varchar(4000),
--     avail varchar(100),
--     title varchar(4000),
--     research boolean,
--     reqname varchar(4000),
--     requestId varchar(100),
--     QCState integer,
--
--     Container ENTITYID NOT NULL,
--     CreatedBy USERID NOT NULL,
--     Created TIMESTAMP NOT NULL,
--     ModifiedBy USERID NOT NULL,
--     Modified TIMESTAMP NOT NULL,
--
--     CONSTRAINT PK_project PRIMARY KEY (project)
-- );



DROP TABLE IF EXISTS ehr.client_errors;
CREATE TABLE ehr.client_errors
(
    rowid serial not null,
    page varchar(4000),
    exception varchar(4000),
    json text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_client_errors PRIMARY KEY (rowid)
);




DROP TABLE IF EXISTS ehr.qcStateMetadata;
CREATE TABLE ehr.qcStateMetadata
(
    QCStateLabel varchar(4000) NOT NULL,
    draftData boolean default false,
    isDeleted boolean default false,
    isRequest boolean default false,

    CONSTRAINT PK_qcStateMetadata PRIMARY KEY (QCStateLabel)
);

INSERT INTO ehr.qcStateMetadata
(QCStateLabel,draftData,isDeleted,isRequest)
VALUES
('Approved', FALSE, FALSE, FALSE),
('In Progress', TRUE, FALSE, FALSE),
('Abnormal', FALSE, FALSE, FALSE),
('Review Required', FALSE, FALSE, FALSE),
('Request: Pending', FALSE, FALSE, TRUE),
('Delete Requested', TRUE, FALSE, FALSE),
('Deleted', FALSE, TRUE, FALSE),
('Request: Denied', FALSE, FALSE, TRUE),
('Request: Approved', TRUE, FALSE, TRUE),
('Request: Complete', FALSE, FALSE, TRUE)
;

/* EHR-11.101-11.102.sql */

DROP TABLE IF EXISTS ehr.qcPermissionMap;


DROP TABLE IF EXISTS ehr.module_properties;
CREATE TABLE ehr.module_properties (
    RowId SERIAL NOT NULL,

    prop_name varchar(255) DEFAULT NULL,
    stringvalue varchar(255) DEFAULT NULL,
    floatvalue float DEFAULT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_module_properties PRIMARY KEY (RowId),
    CONSTRAINT UNIQUE_module_properties UNIQUE (prop_name, container)
);

DROP TABLE IF EXISTS ehr.site_module_properties;
CREATE TABLE ehr.site_module_properties (
    prop_name varchar(255) DEFAULT NULL,
    stringvalue varchar(255) DEFAULT NULL,
    floatvalue float DEFAULT NULL,

    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_site_module_properties PRIMARY KEY (prop_name)
);

-- ----------------------------
-- Table structure for ehr.reports
-- ----------------------------
DROP TABLE IF EXISTS ehr.reports;
CREATE TABLE ehr.reports (
rowid serial not null,
ReportName varchar(255) DEFAULT NULL,
Category varchar(255) DEFAULT NULL,
ReportType varchar(255) DEFAULT NULL,
ReportTitle varchar(255) DEFAULT NULL,
Visible bool DEFAULT NULL,
ContainerPath varchar(255) DEFAULT NULL,
SchemaName varchar(255) DEFAULT NULL,
QueryName varchar(255) DEFAULT NULL,
ViewName varchar(255) DEFAULT NULL,
Report varchar(255) DEFAULT NULL,
DateFieldName varchar(255) DEFAULT NULL,
TodayOnly bool DEFAULT NULL,
QueryHasLocation bool DEFAULT NULL,
--added
QCStatePublicDataFieldName varchar(255) default null,

Container ENTITYID NOT NULL,
CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_reports PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;

/* EHR-11.102-11.105.sql */

ALTER TABLE ehr.cage_observations
  add column no_observations boolean
;

ALTER TABLE ehr.requests
  add column remark varchar(4000)
;

ALTER TABLE ehr.cage_observations
  drop column roomcage
;

/* EHR-11.105-11.106.sql */

ALTER TABLE ehr.reports
  add column jsonConfig varchar(4000)
;

/* EHR-11.107-11.108.sql */

ALTER TABLE ehr.reports
  add column description varchar(4000)
;

/* EHR-11.108-11.109.sql */

INSERT INTO ehr.qcStateMetadata
(QCStateLabel,draftData,isDeleted,isRequest)
VALUES
('Completed', FALSE, FALSE, FALSE),
('Scheduled', TRUE, FALSE, FALSE)
;

/* EHR-11.109-11.110.sql */

ALTER TABLE ehr.formTypes ADD COLUMN configJson text;

/* EHR-11.113-11.114.sql */

DROP TABLE IF EXISTS ehr.animal_groups;
CREATE TABLE ehr.animal_groups (
    name varchar(255) NOT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_animal_groups PRIMARY KEY (name)
);

/* EHR-11.116-11.117.sql */

DROP TABLE IF EXISTS ehr.formTypes;
CREATE TABLE ehr.formTypes
(
    rowid serial not null,
    formtype varchar(200) NOT NULL,
    category varchar (100),
    description text,
    configJson varchar(4000),

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_formTypes PRIMARY KEY (rowid),
    CONSTRAINT UNIQUE_formTypes UNIQUE (container, formtype)
);

alter table ehr.protocols
  drop column container;

alter table ehr.project
  drop column container;

DROP TABLE IF EXISTS ehr.animal_groups;
CREATE TABLE ehr.animal_groups (
    rowid serial not null,
    name varchar(255) NOT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_animal_groups PRIMARY KEY (rowid)
);


DROP TABLE IF EXISTS ehr.supplemental_pedigree;
CREATE TABLE ehr.supplemental_pedigree (
    rowid serial not null,
    Id varchar(50) NOT NULL,
    gender varchar(50),
    dam varchar(50),
    sire varchar(50),

    --Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_supplemental_pedigree PRIMARY KEY (rowid)
);

/* EHR-11.118-11.119.sql */

ALTER TABLE ehr.supplemental_pedigree
    add column birth timestamp,
    add column acquiredate timestamp,
    add column departdate timestamp
;

/* EHR-11.119-11.120.sql */

ALTER TABLE ehr.tasks
    add column datecompleted timestamp
;


ALTER table ehr.qcStateMetadata
  add column allowFutureDates bool
;

DELETE from ehr.qcStateMetadata;

INSERT INTO ehr.qcStateMetadata
(QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates)
VALUES
('Approved', FALSE, FALSE, FALSE, FALSE),
('In Progress', TRUE, FALSE, FALSE, TRUE),
('Abnormal', FALSE, FALSE, FALSE, FALSE),
('Review Required', FALSE, FALSE, FALSE, TRUE),
('Request: Pending', FALSE, FALSE, TRUE, TRUE),
('Delete Requested', TRUE, FALSE, FALSE, TRUE),
('Deleted', FALSE, TRUE, FALSE, TRUE),
('Request: Denied', FALSE, FALSE, TRUE, TRUE),
('Request: Approved', TRUE, FALSE, TRUE, TRUE),
('Request: Complete', FALSE, FALSE, TRUE, TRUE),
('Scheduled', TRUE, FALSE, FALSE, TRUE)
;

/* EHR-11.120-11.121.sql */

UPDATE ehr.qcStateMetadata
SET DraftData = FALSE
WHERE QCStateLabel = 'Delete Requested';

/* EHR-11.121-11.122.sql */

ALTER table ehr.reports
  add column sort_order integer
  ;

/* EHR-11.133-11.134.sql */

insert into ehr.notificationtypes
(notificationtype,description) VALUES
('Incompleted Treatments', 'An email will be sent each day at 8:30, 15:30 and 20:30 notifying of any incompleted treatments')
;

DROP TABLE IF EXISTS ehr.automatic_alerts;
CREATE TABLE ehr.automatic_alerts (
rowid serial not null,
title varchar(200) DEFAULT NULL,

ContainerPath varchar(255) DEFAULT NULL,
SchemaName varchar(255) DEFAULT NULL,
QueryName varchar(255) DEFAULT NULL,
ViewName varchar(255) DEFAULT NULL,
notificationtype varchar(100) default null,
email_html text DEFAULT NULL,

Container ENTITYID NOT NULL,
CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_automatic_alerts PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;

/* EHR-11.134-11.135.sql */

-- INSERT command moved to EHR_Lookups-11.134-11.135.sql;

/* EHR-11.137-11.138.sql */

alter table ehr.cage_observations
  add column feces varchar(100)
  ;

/* EHR-11.138-11.139.sql */

DROP TABLE IF EXISTS ehr.kinship;
CREATE TABLE ehr.kinship (
    RowId SERIAL NOT NULL,

    Id varchar(100) NOT NULL,
    Id2 varchar(100) NOT NULL,
    coefficient double precision DEFAULT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_kinship PRIMARY KEY (RowId)
);

update ehr.qcStateMetadata set qcstatelabel = 'Completed' WHERE qcstatelabel = 'Approved';

/* EHR-11.145-11.146.sql */

alter table ehr.formtypes
  add column permitsSingleIdOnly bool
;



UPDATE ehr.qcStateMetadata
SET DraftData = TRUE
WHERE QCStateLabel = 'Review Requested';

/* EHR-11.20-11.30.sql */

/* EHR-11.25-11.26.sql */

insert into ehr.notificationtypes
(notificationtype,description) VALUES
('Blood Draw Request Completed', 'An email will be sent each time a blood draw request is completed'),
('Blood Draw Request Denied', 'An email will be sent each time a blood draw request is denied'),
('Clinpath Request Completed', 'An email will be sent each time a clinpath request is completed'),
('Clinpath Request Denied', 'An email will be sent each time a clinpath request is denied')
;



alter TABLE ehr.notificationRecipients
  add column Recipient2 integer
;

update ehr.notificationRecipients set recipient2 = cast(recipient as integer);

alter TABLE ehr.notificationRecipients
  drop column Recipient
;

alter TABLE ehr.notificationRecipients
  rename column Recipient2 to Recipient
;

/* EHR-11.26-11.27.sql */

--NOTE: the following from moved form EHR-11.146-11.24.sql to this script due to an issue with the 11.2 -> trunk merge
-- alter table ehr.protocols rename to protocol;

DROP TABLE IF EXISTS ehr.protocols;
DROP TABLE IF EXISTS ehr.protocol;
CREATE TABLE ehr.protocol
(
    protocol varchar(4000) NOT NULL,
    inves varchar(200),
    approve TIMESTAMP,
    description text,

    --Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_protocol PRIMARY KEY (protocol)
);


DROP TABLE IF EXISTS ehr.project;
CREATE TABLE ehr.project
(
    project integer not null,
    protocol varchar(200),
    account varchar(200),
    inves varchar(4000),
    avail varchar(100),
    title varchar(4000),
    research boolean,
    reqname varchar(4000),
    requestId varchar(100),
    QCState integer,

    --Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_project PRIMARY KEY (project)
);

DROP TABLE IF EXISTS ehr.protocolProcedures;
CREATE TABLE ehr.protocolProcedures
(
    rowid serial not null,
    protocol varchar(200) not null,
    procedureName varchar(200),
    code varchar(100),
    allowed double precision,
    frequency varchar(2000),

    --Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_protocolProcedures PRIMARY KEY (rowid)
);

alter TABLE ehr.requests
  add column notify3 integer
;


alter TABLE ehr.protocol
  add column maxAnimals integer
;

/* EHR-11.27-11.28.sql */

insert into ehr.notificationtypes
(notificationtype,description) VALUES
('Prenatal Death', 'An email will be sent each time a prenatal death is reported')
;

/* EHR-11.28-11.29.sql */

delete from ehr.notificationtypes where notificationtype in (
'Clinpath Abnormal Results',
'Clinpath Results',
'Clinpath Admin Alerts',
'Incomplete Treatments',
'Weight Drops',
'Admin Alerts',
'Blood Admin Alerts',
'Blood Alerts',
'Colony Alerts',
'Colony Alerts Lite',
'Colony Management Alerts',
'Overdue Weight Alerts',
'Site Error Alerts'

);

delete from ehr.notificationtypes where notificationtype = 'Colony Validation - General';

insert into ehr.notificationtypes
(notificationtype,description) VALUES
('Clinpath Abnormal Results', 'An email will be sent periodically to summarize abnormal clinpath results'),
('Clinpath Results', 'A daily email will be sent to summarize finalized clinpath results'),
('Clinpath Admin Alerts', 'A daily email will be sent to summarize clinpath requests'),
('Incomplete Treatments', 'An email will be sent 3-4X per day to summarize incomplete treatments'),
('Weight Drops', 'An email will be sent daily to summarize weight drops in the last 3 days'),
('Admin Alerts', 'An email will be sent daily to summarize site usage, client errors, etc.'),
('Blood Admin Alerts', 'An email will be sent daily to summarize the blood schedule and problems with it.'),
('Blood Alerts', 'An email will be sent 3X daily to summarize completed and scheduled blood draws.'),
('Colony Alerts', 'An email will be sent daily to summarize many aspects of the colony, focused on data validation.'),
('Colony Alerts Lite', 'An hourly email will be mailed if any data problems are identified, such as double housing.'),
('Colony Management Alerts', 'An email will be sent daily to summarize information related to colony management and housing.'),
('Overdue Weight Alerts', 'An email will be sent daily to summarize animals overdue for weights.'),
('Site Error Alerts', 'An hourly email will be sent if a new site error is reported.')
;

/* EHR-11.30-12.10.sql */

/* EHR-11.35-11.36.sql */

drop TABLE ehr.client_errors;

--modify column sizes:
alter table ehr.project alter column title TYPE varchar(200);
alter table ehr.project alter column inves TYPE varchar(200);
alter table ehr.project alter column reqname TYPE varchar(200);

alter table ehr.project alter column protocol TYPE varchar(200);

alter table ehr.protocol_counts alter column protocol TYPE varchar(200);

alter table ehr.requests alter column title TYPE varchar(200);

alter table ehr.tasks alter column title TYPE varchar(200);

alter table ehr.qcstatemetadata alter column qcstatelabel TYPE varchar(200);

alter table ehr.formpanelsections alter column formtype TYPE varchar(200);
alter table ehr.formpanelsections alter column destination TYPE varchar(200);
alter table ehr.formpanelsections alter column title TYPE varchar(200);

alter table ehr.formtemplaterecords alter column storeid TYPE varchar(1000);

alter table ehr.formtemplates alter column title TYPE varchar(200);
alter table ehr.formtemplates alter column formtype TYPE varchar(200);

alter table ehr.notificationrecipients alter column notificationtype TYPE varchar(200);

alter table ehr.notificationtypes alter column notificationtype TYPE varchar(200);

--add container columns:
alter table ehr.supplemental_pedigree add column container entityid;

--update the wisconsin site - only active EHR user
update ehr.supplemental_pedigree p set container = (select entityid from core.containers where name = 'EHR');

/* EHR-11.36-11.37.sql */

CREATE TABLE ehr.status
(
  rowid SERIAL NOT NULL,
  label varchar(200) NOT NULL,
  description varchar(4000),
  publicdata boolean DEFAULT false,
  draftdata boolean DEFAULT false,
  isdeleted boolean DEFAULT false,
  isrequest boolean DEFAULT false,
  allowfuturedates boolean DEFAULT false,
  CONSTRAINT pk_status PRIMARY KEY (rowid)
);

INSERT INTO ehr.status (rowid, label, description, publicdata, draftdata, isdeleted, isrequest, allowfuturedates)

(select q.rowid, q.label, q.description, q.publicdata, m.draftdata, m.isdeleted, m.isrequest, m.allowfuturedates
from study.qcstate q left join ehr.qcstatemetadata m on q.label = m.QCStateLabel);

--drop table ehr.qcstatemetadata;

/* EHR-12.20-12.30.sql */

/* EHR-12.21-12.22.sql */

CREATE TABLE ehr.chargedItems (
    rowid SERIAL NOT NULL,
    id varchar(100),
    date TIMESTAMP,
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
    created TIMESTAMP,
    modifiedBy USERID,
    modified TIMESTAMP,

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
    startdate TIMESTAMP,
    enddate TIMESTAMP,
    externalid varchar(200),
    comment varchar(4000),
    tier integer,

    createdBy USERID,
    created TIMESTAMP,
    modifiedBy USERID,
    modified TIMESTAMP,

    CONSTRAINT PK_accounts PRIMARY KEY (account)
);

CREATE TABLE ehr.investigators (
    RowId SERIAL NOT NULL,
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
    DateCreated TIMESTAMP,
    DateDisabled TIMESTAMP,
    Division varchar(100),

    --container entityid,
    createdby userid,
    created TIMESTAMP,
    modifiedby userid,
    modified TIMESTAMP,
    CONSTRAINT pk_investigators PRIMARY KEY (rowid)
);

/* EHR-12.22-12.23.sql */

--user / role for a given procedure
CREATE TABLE ehr.encounter_participants (
  rowid serial,
  userid int,
  username varchar(500),
  role varchar(200),
  procedure_id entityid,
  comment varchar(4000),
  container entityid NOT NULL,
  createdby userid,
  created timestamp,
  modifiedby userid,
  modified timestamp,

  constraint pk_encounter_participants PRIMARY KEY (rowid)
);


ALTER TABLE ehr.protocol
  add enddate timestamp,
  add title varchar(1000),
  add usda_level varchar(100),
  add external_id varchar(200),
  add project_type varchar(200),
  add ibc_approval_required boolean,
  add ibc_approval_num varchar(200)
;

ALTER table ehr.project drop requestid;

/* EHR-12.23-12.24.sql */

-- Call to Java upgrade code no longer needed

/* EHR-12.26-12.27.sql */

DROP table ehr.site_module_properties;
DROP table ehr.automatic_alerts;

/* EHR-12.27-12.28.sql */

ALTER TABLE ehr.animal_groups add column category varchar(100);
ALTER TABLE ehr.animal_groups drop column container;

CREATE TABLE ehr.animal_group_members (
  rowid serial,
  date timestamp,
  enddate timestamp,
  groupname integer,
  comment varchar(4000),

  objectid entityid,
  container entityid NOT NULL,
  createdby userid,
  created timestamp,
  modifiedby userid,
  modified timestamp,

  constraint pk_animal_group_members PRIMARY KEY (rowid)
);

CREATE TABLE ehr.scheduled_tasks (
  rowid serial,
  taskid ENTITYID NOT NULL,
  tasktype varchar(200),
  date timestamp,
  enddate timestamp,
  frequency int,
  id varchar(100),
  location varchar(100),
  description varchar(4000),
  json text,

  objectid entityid,
  container entityid NOT NULL,
  createdby userid,
  created timestamp,
  modifiedby userid,
  modified timestamp,

  constraint pk_scheduled_tasks PRIMARY KEY (rowid)
);

CREATE TABLE ehr.scheduled_task_types (
  tasktype varchar(200),

  constraint pk_scheduled_task_types PRIMARY KEY (tasktype)
);

ALTER TABLE ehr.encounter_participants ADD COLUMN objectid ENTITYID;

/* EHR-12.28-12.29.sql */

ALTER TABLE ehr.project add contact_emails varchar(4000);
ALTER TABLE ehr.project DROP COLUMN qcstate;

/* EHR-12.30-12.301.sql */

ALTER TABLE ehr.snomed_tags ADD objectid ENTITYID;

/* EHR-12.301-12.302.sql */

ALTER TABLE ehr.protocolProcedures ADD startdate timestamp;
ALTER TABLE ehr.protocolProcedures ADD enddate timestamp;
ALTER TABLE ehr.protocolProcedures ADD objectid entityid;


CREATE TABLE ehr.encounter_flags (
  rowid serial,
  id varchar(100),
  date timestamp,
  parentid entityid,
  schemaName varchar(100),
  queryName varchar(100),
  flag varchar(200),
  value varchar(100),
  remark varchar(4000),

  objectid entityid,
  container entityid NOT NULL,
  createdby userid,
  created timestamp,
  modifiedby userid,
  modified timestamp,

  constraint pk_encounter_flags PRIMARY KEY (rowid)
);

CREATE TABLE ehr.encounter_summaries (
  rowid serial,
  id varchar(100),
  date timestamp,
  parentid entityid,
  schemaName varchar(100),
  queryName varchar(100),
  remark text,

  objectid entityid,
  container entityid NOT NULL,
  createdby userid,
  created timestamp,
  modifiedby userid,
  modified timestamp,

  constraint pk_encounter_summaries PRIMARY KEY (rowid)
);

alter table ehr.project add startdate timestamp;
alter table ehr.project add enddate timestamp;
alter table ehr.project add inves2 varchar(200);

alter table ehr.accounts add objectid entityid;
alter table ehr.accounts add active boolean default true;
alter table ehr.accounts add fiscalAuthority varchar(200);

drop table ehr.chargedItems;

CREATE TABLE ehr.projectAccountHistory (
  rowid serial,
  project int,
  account varchar(200),
  startdate timestamp,
  enddate timestamp,
  objectid entityid,
  createdby userid,
  created timestamp,
  modifiedby userid,
  modified timestamp
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

update ehr.snomed_tags set set_number = 1 where set_number is null;

/* EHR-12.316-12.317.sql */

ALTER TABLE ehr.encounter_participants rename procedure_id to parentid;

CREATE INDEX encounter_flags_objectid ON ehr.encounter_flags (objectid);

CREATE INDEX encounter_flags_parentid ON ehr.encounter_flags (parentid);

CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);

CREATE INDEX encounter_participants_parentid ON ehr.encounter_participants (parentid);

CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);

CREATE INDEX encounter_summaries_parentid ON ehr.encounter_summaries (parentid);

CREATE INDEX snomed_tags_objectid ON ehr.snomed_tags (objectid);

CREATE INDEX snomed_tags_recordid ON ehr.snomed_tags (recordid);

/* EHR-12.317-12.318.sql */

ALTER TABLE ehr.protocol ADD last_modification timestamp;

/* EHR-12.321-12.322.sql */

ALTER TABLE ehr.protocol_counts add project integer;
ALTER TABLE ehr.protocol_counts add start timestamp;
ALTER TABLE ehr.protocol_counts add enddate timestamp;
ALTER TABLE ehr.protocol_counts add gender varchar(100);

ALTER TABLE ehr.protocol add first_approval timestamp;

ALTER TABLE ehr.protocolProcedures add project integer;
ALTER TABLE ehr.protocolProcedures add daysBetween integer;

ALTER TABLE ehr.snomed_tags add id varchar(100);
ALTER TABLE ehr.snomed_tags add date timestamp;

/* EHR-12.322-12.323.sql */

ALTER TABLE ehr.encounter_participants add Id varchar(100);

--see 12.321-12.322
ALTER TABLE ehr.snomed_tags DROP COLUMN date;
ALTER TABLE ehr.snomed_tags ADD caseid entityid;
ALTER TABLE ehr.snomed_tags ADD parentid entityid;

CREATE INDEX encounter_flags_id ON ehr.encounter_flags (id);
CREATE INDEX encounter_encounter_participants_id ON ehr.encounter_participants (id);
CREATE INDEX encounter_summaries_id ON ehr.encounter_summaries (id);
CREATE INDEX snomed_tags_id ON ehr.snomed_tags (Id);
CREATE INDEX snomed_tags_parentid ON ehr.snomed_tags (parentid);
CREATE INDEX snomed_tags_caseid ON ehr.snomed_tags (caseid);

/* EHR-12.324-12.325.sql */

DROP INDEX ehr.snomed_tags_objectid;
ALTER TABLE ehr.snomed_tags ALTER COLUMN objectid TYPE varchar(50);
CREATE INDEX snomed_tags_objectid ON ehr.snomed_tags (objectid);

DROP INDEX ehr.encounter_flags_objectid;
ALTER TABLE ehr.encounter_flags ALTER COLUMN objectid TYPE varchar(50);
CREATE INDEX encounter_flags_objectid ON ehr.encounter_flags (objectid);

DROP INDEX ehr.encounter_participants_objectid;
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid TYPE varchar(50);
CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);

DROP INDEX ehr.encounter_summaries_objectid;
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid TYPE varchar(50);
CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);

/* EHR-12.325-12.326.sql */

DROP INDEX ehr.snomed_tags_objectid;
ALTER TABLE ehr.snomed_tags ALTER COLUMN objectid TYPE varchar(60);
CREATE INDEX snomed_tags_objectid ON ehr.snomed_tags (objectid);

DROP INDEX ehr.encounter_flags_objectid;
ALTER TABLE ehr.encounter_flags ALTER COLUMN objectid TYPE varchar(60);
CREATE INDEX encounter_flags_objectid ON ehr.encounter_flags (objectid);

DROP INDEX ehr.encounter_participants_objectid;
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid TYPE varchar(60);
CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);

DROP INDEX ehr.encounter_summaries_objectid;
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid TYPE varchar(60);
CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);

/* EHR-12.327-12.328.sql */

ALTER TABLE ehr.animal_groups ADD container entityid;
ALTER TABLE ehr.animal_groups ADD date timestamp;
ALTER TABLE ehr.animal_groups ADD enddate timestamp;
ALTER TABLE ehr.animal_groups ADD objectid entityid;
ALTER TABLE ehr.animal_groups ADD purpose varchar(4000);
ALTER TABLE ehr.animal_groups ADD comment text;

ALTER TABLE ehr.animal_group_members ADD id varchar(200);

ALTER TABLE ehr.animal_group_members DROP COLUMN groupname;
ALTER TABLE ehr.animal_group_members ADD groupId int;

/* EHR-12.329-12.330.sql */

DROP INDEX ehr.encounter_encounter_participants_id;
CREATE INDEX encounter_participants_id ON ehr.encounter_participants (id);

/* EHR-12.330-12.331.sql */

ALTER TABLE ehr.protocol_counts ADD objectid entityid;

/* EHR-12.331-12.332.sql */

--remove not null constraint
alter table ehr.protocol_counts alter column protocol drop not null;

/* EHR-12.332-12.333.sql */

CREATE INDEX snomed_tags_id_recordid ON ehr.snomed_tags (id, recordid);

/* EHR-12.334-12.335.sql */

DROP INDEX ehr.snomed_tags_id_recordid;

CREATE INDEX snomed_tags_id_recordid_code on ehr.snomed_tags (id, recordid, code);

/* EHR-12.335-12.336.sql */

;

/* EHR-12.341-12.342.sql */

alter table ehr.project add use_category varchar(100);

/* EHR-12.342-12.343.sql */

CREATE INDEX animal_group_members_groupId_container ON ehr.animal_group_members (groupId, container);

--NOTE: this is different than the SQLServer version
CREATE INDEX project_investigatorid_project ON ehr.project (investigatorId, project);

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
  rowid serial,
  treatmentid entityid,
  time int,

  objectid entityid,
  container entityid,
  created timestamp,
  createdby int,
  modified timestamp,
  modifiedby int,

  constraint PK_teatment_times PRIMARY KEY (rowid)
);

/* EHR-12.346-12.347.sql */

CREATE INDEX project_name_project ON ehr.project (name, project);

CREATE INDEX snomed_tags_code_container ON ehr.snomed_tags (code, container);

/* EHR-12.350-12.351.sql */

--NOTE: added sqlserver only index with this update
;

/* EHR-12.355-12.356.sql */

ALTER TABLE ehr.requests ADD sendemail bool;
ALTER TABLE ehr.reports ADD subjectIdFieldName varchar(200);

/* EHR-12.356-12.357.sql */

ALTER TABLE ehr.project ADD alwaysavailable bool;

/* EHR-12.358-12.359.sql */

INSERT INTO ehr.qcstateMetadata (QCStateLabel,draftData,isDeleted,isRequest)
VALUES ('Request: Sample Delivered', TRUE, FALSE, TRUE);

/* EHR-12.359-12.360.sql */

CREATE TABLE ehr.protocolexemptions (
  rowid SERIAL,
  protocol VARCHAR(100),
  project INTEGER,
  exemption VARCHAR(200),
  startdate TIMESTAMP,
  enddate TIMESTAMP,
  remark VARCHAR(4000),

  container ENTITYID,
  createdby INTEGER,
  created TIMESTAMP,
  modifiedby INTEGER,
  modified TIMESTAMP,

  CONSTRAINT PK_protocolExemptions PRIMARY KEY (rowid)
);

/* EHR-12.361-12.362.sql */

ALTER TABLE ehr.snomed_tags ADD taskid entityid;

/* EHR-12.362-12.363.sql */

ALTER TABLE ehr.encounter_participants ADD taskid entityid;

/* EHR-12.363-12.364.sql */

truncate table ehr.encounter_participants;

--this might have been created by EHRManager
SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'INDEX', 'encounter_participants_objectid');

ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid SET NOT NULL;

SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'CONSTRAINT', 'pk_encounter_participants');

ALTER TABLE ehr.encounter_participants ADD CONSTRAINT pk_encounter_participants PRIMARY KEY (objectid);

SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'INDEX', 'encounter_participants_container_rowid_id');
SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'INDEX', 'encounter_participants_container_rowid_parentid');

ALTER TABLE ehr.encounter_participants DROP COLUMN rowid;

/* EHR-12.364-12.365.sql */

--this might have been created by EHRManager
SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'INDEX', 'encounter_participants_objectid');
SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'CONSTRAINT', 'pk_encounter_participants');

ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid TYPE VARCHAR(60);

ALTER TABLE ehr.encounter_participants ADD CONSTRAINT pk_encounter_participants PRIMARY KEY (objectid);

/* EHR-12.371-12.372.sql */

ALTER TABLE ehr.project ADD shortname varchar(200);

/* EHR-12.372-12.373.sql */

--this might have been created by EHRManager
SELECT core.fn_dropifexists('encounter_summaries', 'ehr', 'index', 'encounter_summaries_objectid');
SELECT core.fn_dropifexists('encounter_summaries', 'ehr', 'index', 'encounter_summaries_parentid_rowid_container_id');
SELECT core.fn_dropifexists('encounter_summaries', 'ehr', 'index', 'encounter_summaries_container_rowid');
SELECT core.fn_dropifexists('encounter_summaries', 'ehr', 'constraint', 'PK_encounter_summaries');

ALTER TABLE ehr.encounter_summaries ADD taskid entityid;
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid SET NOT NULL;

ALTER TABLE ehr.encounter_summaries ADD CONSTRAINT PK_encounter_summaries PRIMARY KEY (objectid);
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

INSERT INTO ehr.qcStateMetadata (QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Cancelled', false, false, true, true);

/* EHR-12.378-12.379.sql */

ALTER TABLE ehr.project ADD projecttype varchar(100);

/* EHR-12.379-12.380.sql */

ALTER TABLE ehr.formtemplates ADD category varchar(100);

/* EHR-12.381-12.382.sql */

ALTER TABLE ehr.formtemplates drop column template;
ALTER TABLE ehr.formtemplaterecords ADD targettemplate varchar(100);

/* EHR-12.384-12.385.sql */

ALTER TABLE ehr.snomed_tags DROP CONSTRAINT PK_snomed_tags;
DROP INDEX ehr.snomed_tags_recordid_rowid_id;
DROP INDEX ehr.snomed_tags_code_rowid_id_recordid;
DROP INDEX ehr.snomed_tags_parentid;
DROP INDEX ehr.snomed_tags_caseid;
DROP INDEX ehr.snomed_tags_objectid;

ALTER TABLE ehr.snomed_tags DROP COLUMN rowid;
ALTER TABLE ehr.snomed_tags DROP COLUMN parentid;
ALTER TABLE ehr.snomed_tags DROP COLUMN caseid;
ALTER TABLE ehr.snomed_tags DROP COLUMN schemaName;
ALTER TABLE ehr.snomed_tags DROP COLUMN queryName;
ALTER TABLE ehr.snomed_tags ALTER COLUMN objectid SET NOT NULL;

CREATE INDEX snomed_tags_objectid on ehr.snomed_tags (objectid);
ALTER TABLE ehr.snomed_tags ADD CONSTRAINT PK_snomed_tags PRIMARY KEY (objectid);

/* EHR-12.385-12.386.sql */

--removed after monitoring usage on site
DROP INDEX ehr.encounter_summaries_parentid;
DROP INDEX ehr.encounter_summaries_parentid_objectid_container_id;
DROP INDEX ehr.encounter_summaries_objectid;

CREATE INDEX encounter_summaries_taskid ON ehr.encounter_summaries (taskid);

DROP INDEX ehr.encounter_participants_objectid;

DROP INDEX ehr.snomed_tags_id_recordid_code;
DROP INDEX ehr.snomed_tags_id;
DROP INDEX ehr.snomed_tags_recordid;
DROP INDEX ehr.snomed_tags_recordid_container_code;

/* EHR-12.386-12.387.sql */

DROP INDEX ehr.snomed_tags_objectid;

/* EHR-12.387-12.388.sql */

ALTER TABLE ehr.encounter_summaries ADD category varchar(100);

/* EHR-12.388-12.389.sql */

ALTER TABLE ehr.snomed_tags ADD parentid entityid;

/* EHR-12.393-12.394.sql */

ALTER TABLE ehr.project ADD container entityid;
ALTER TABLE ehr.protocol ADD container entityid;

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

ALTER TABLE ehr.project DROP CONSTRAINT PK_project;
ALTER TABLE ehr.protocol DROP CONSTRAINT PK_protocol;

ALTER TABLE ehr.project ADD objectid UUID NOT NULL DEFAULT ehr.uuid();
ALTER TABLE ehr.protocol ADD objectid UUID NOT NULL DEFAULT ehr.uuid();

ALTER TABLE ehr.project ADD CONSTRAINT PK_project PRIMARY KEY (objectid);
ALTER TABLE ehr.protocol ADD CONSTRAINT PK_protocol PRIMARY KEY (objectid);

/* EHR-12.395-12.396.sql */

ALTER TABLE ehr.project DROP CONSTRAINT PK_project;
ALTER TABLE ehr.protocol DROP CONSTRAINT PK_protocol;

ALTER TABLE ehr.project ALTER COLUMN objectid TYPE entityid;
ALTER TABLE ehr.protocol ALTER COLUMN objectid TYPE entityid;

ALTER TABLE ehr.project ADD CONSTRAINT PK_project PRIMARY KEY (objectid);
ALTER TABLE ehr.protocol ADD CONSTRAINT PK_protocol PRIMARY KEY (objectid);

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

ALTER TABLE ehr.animal_group_members DROP CONSTRAINT pk_animal_group_members;
ALTER TABLE ehr.animal_group_members DROP COLUMN rowid;
ALTER TABLE ehr.animal_group_members DROP COLUMN comment;
ALTER TABLE ehr.animal_group_members ADD remark varchar(4000);
ALTER TABLE ehr.animal_group_members ALTER COLUMN objectid SET NOT NULL;
ALTER TABLE ehr.animal_group_members ADD CONSTRAINT pk_animal_group_members PRIMARY KEY (objectid);

/* EHR-12.402-12.403.sql */

ALTER TABLE ehr.snomed_tags ADD formsort integer;
ALTER TABLE ehr.snomed_tags ADD date timestamp;
ALTER TABLE ehr.encounter_summaries ADD formsort integer;
ALTER TABLE ehr.encounter_participants ADD formsort integer;

ALTER TABLE ehr.formtemplates ADD hidden bool default false;
UPDATE ehr.formtemplates SET hidden = false;

/* EHR-12.404-12.405.sql */

alter table ehr.kinship alter column coefficient TYPE double precision;

/* EHR-12.409-12.410.sql */

CREATE INDEX IDX_requests_requestid_container ON ehr.requests (requestid, container);
CREATE INDEX IDX_container_project_objectid_name ON ehr.project (container, project, objectid, name);

/* EHR-12.415-12.416.sql */

ALTER TABLE ehr.protocol ADD lastAnnualReview timestamp;

/* EHR-12.416-12.417.sql */

ALTER TABLE ehr.protocol_counts ADD description varchar(4000);

/* EHR-12.417-12.418.sql */

DROP INDEX ehr.encounter_flags_objectid;
DROP INDEX ehr.encounter_flags_parentid;

/* EHR-12.418-12.419.sql */

ALTER TABLE ehr.formtemplates DROP CONSTRAINT UNIQUE_formTemplates;

ALTER TABLE ehr.formtemplates ADD CONSTRAINT UNIQUE_formTemplates UNIQUE (container, formtype, title);

/* EHR-12.419-12.420.sql */

UPDATE ehr.qcStateMetadata SET draftData = true WHERE QCStateLabel = 'Review Required';

/* EHR-12.421-12.422.sql */

/* Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE INDEX IDX_treatment_times_treatmentid ON ehr.treatment_times (treatmentid);

/* EHR-12.424-12.425.sql */

CREATE FUNCTION ehr.handleUpgrade() RETURNS VOID AS $$
DECLARE
    BEGIN
      IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='protocolprocedures' and table_schema='ehr' and column_name='remark'
      )
      THEN
        -- Run variants of scripts from onprc14.2 branch
        ALTER TABLE ehr.protocolprocedures add remark TEXT;
      END IF;
    END;
$$ LANGUAGE plpgsql;

SELECT ehr.handleUpgrade();

DROP FUNCTION ehr.handleUpgrade();

SELECT core.fn_dropifexists('treatment_times', 'ehr', 'Index', 'IDX_treatment_times_treatmentid');

CREATE INDEX IDX_treatment_times_treatmentid ON ehr.treatment_times (treatmentid);

/* EHR-12.425-12.426.sql */

ALTER TABLE ehr.project ALTER COLUMN Title TYPE VARCHAR(400);