/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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