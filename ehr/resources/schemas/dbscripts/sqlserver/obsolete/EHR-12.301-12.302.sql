/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.protocolProcedures ADD startdate datetime;
ALTER TABLE ehr.protocolProcedures ADD enddate datetime;
ALTER TABLE ehr.protocolProcedures ADD objectid entityid;

CREATE TABLE ehr.encounter_flags (
  rowid int identity(1,1),
  id varchar(100),
  date datetime,
  parentid entityid,
  schemaName varchar(100),
  queryName varchar(100),
  flag varchar(200),
  value varchar(100),
  remark varchar(4000),

  objectid entityid,
  container entityid NOT NULL,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,

  constraint pk_encounter_flags PRIMARY KEY (rowid)
);

CREATE TABLE ehr.encounter_summaries (
  rowid int identity(1,1),
  id varchar(100),
  date datetime,
  parentid entityid,
  schemaName varchar(100),
  queryName varchar(100),
  remark text,

  objectid entityid,
  container entityid NOT NULL,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,

  constraint pk_encounter_summaries PRIMARY KEY (rowid)
);

alter table ehr.project add startdate datetime;
alter table ehr.project add enddate datetime;
alter table ehr.project add inves2 varchar(200);

alter table ehr.accounts add objectid entityid;
alter table ehr.accounts add active bit default 1;
alter table ehr.accounts add fiscalAuthority varchar(200);

drop table ehr.chargedItems;

CREATE TABLE ehr.projectAccountHistory (
  rowid int identity(1,1),
  project int,
  account varchar(200),
  startdate datetime,
  enddate datetime,
  objectid entityid,
  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime
);