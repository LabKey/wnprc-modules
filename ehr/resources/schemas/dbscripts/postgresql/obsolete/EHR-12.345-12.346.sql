/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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
