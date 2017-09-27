/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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