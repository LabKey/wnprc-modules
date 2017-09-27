/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.labwork_services (
  servicename varchar(200),
  dataset varchar(200),
  chargetype varchar(200),
  sampletype varchar(500),
  collectionmethod varchar(500),
  alertOnComplete bit,

  CONSTRAINT PK_labwork_services PRIMARY KEY (servicename)
);

GO
INSERT INTO ehr_lookups.labwork_services (servicename, dataset, alertOnComplete)
SELECT testname, dataset, alertOnComplete FROM ehr_lookups.clinpath_tests;

CREATE TABLE ehr_lookups.labwork_panels (
  rowid int identity(1,1),
  servicename varchar(200),
  testname varchar(200),
  sortorder int,

  CONSTRAINT PK_labwork_panels PRIMARY KEY (rowid)
);

INSERT INTO ehr_lookups.request_priority (priority) VALUES ('ASAP');
ALTER TABLE ehr_lookups.request_priority ADD immediatenotification bit;
GO
UPDATE ehr_lookups.request_priority SET immediatenotification = 0;
UPDATE ehr_lookups.request_priority SET immediatenotification = 1 WHERE priority = 'ASAP';