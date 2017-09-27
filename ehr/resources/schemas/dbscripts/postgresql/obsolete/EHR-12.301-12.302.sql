/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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