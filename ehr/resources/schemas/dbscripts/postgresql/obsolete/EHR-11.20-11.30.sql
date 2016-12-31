/*
 * Copyright (c) 2011-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


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