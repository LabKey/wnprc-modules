/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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