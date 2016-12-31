/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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