/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.animal_condition (
  code integer,
  meaning varchar(100),

  created datetime,
  createdby integer,
  modified datetime,
  modifiedby integer,

  CONSTRAINT PK_animal_condition PRIMARY KEY (code)
);

CREATE TABLE ehr_lookups.rooms (
  room varchar(100),
  building varchar(100),
  area varchar(100),
  category varchar(100),
  maxCages integer,

  created datetime,
  createdby integer,
  modified datetime,
  modifiedby integer,

  CONSTRAINT PK_rooms PRIMARY KEY (room)
);

EXEC sp_rename 'ehr_lookups.cage.roomcage', 'location', 'COLUMN';