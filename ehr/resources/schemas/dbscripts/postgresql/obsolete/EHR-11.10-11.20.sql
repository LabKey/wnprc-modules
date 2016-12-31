/*
 * Copyright (c) 2011-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

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