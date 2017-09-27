/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.lookups (
  rowid serial,
  set_name varchar(100),
  value varchar(200),
  sort_order integer,
  date_disabled timestamp,

  createdby userid,
  created timestamp,
  modifiedby userid,
  modified timestamp,
  objectid char(36),
  CONSTRAINT pk_lookups PRIMARY KEY (rowid)
);

CREATE TABLE ehr_lookups.geographic_origins (
    rowid serial,
    meaning varchar(200),
    description varchar(4000),
    CONSTRAINT pk_geographic_origins PRIMARY KEY (rowid)
);

CREATE TABLE ehr_lookups.note_types (
    rowid serial,
    meaning varchar(200),
    description varchar(4000),
    CONSTRAINT pk_note_types PRIMARY KEY (rowid)
);

INSERT INTO ehr_lookups.note_types (meaning) VALUES ('Clinical');
INSERT INTO ehr_lookups.note_types (meaning) VALUES ('Assignments');