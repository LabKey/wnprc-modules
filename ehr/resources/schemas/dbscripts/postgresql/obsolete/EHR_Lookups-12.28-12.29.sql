/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.treatment_frequency_times (
  rowid serial,
  frequency varchar(100),
  hourofday int,
  timedescription varchar(100),

  CONSTRAINT PK_treatment_frequency_times PRIMARY KEY (rowid)
);

INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - AM', 8, 'AM');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - Noon', 12, 'Noon');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - PM', 14, 'PM');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - Night', 19, 'Night');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - AM/PM', 8, 'AM');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - AM/PM', 14, 'PM');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - AM/Night', 8, 'AM');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - AM/Night', 19, 'Night');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - AM/PM/Night', 8, 'AM');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - AM/PM/Night', 14, 'PM');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - AM/PM/Night', 19, 'Night');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Daily - Any Time', 8, 'AM');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Weekly', 8, 'AM');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Monthly', 8, 'AM');
INSERT INTO ehr_lookups.treatment_frequency_times (frequency, hourofday, timedescription) VALUES ('Alternating Days', 8, 'AM');

ALTER TABLE ehr_lookups.treatment_frequency ADD intervalindays integer;
ALTER TABLE ehr_lookups.treatment_frequency ADD dayofweek integer;
ALTER TABLE ehr_lookups.treatment_frequency ADD dayofmonth integer;
ALTER TABLE ehr_lookups.treatment_frequency ADD weekofmonth integer;

CREATE TABLE ehr_lookups.buildings (
  name varchar(100),
  description varchar(500),

  CONSTRAINT PK_buildings PRIMARY KEY (name)
);

ALTER TABLE ehr_lookups.procedures DROP column code;
ALTER TABLE ehr_lookups.procedures ADD category varchar(100);
ALTER TABLE ehr_lookups.procedures ADD major boolean default false;

CREATE TABLE ehr_lookups.procedure_default_codes (
  rowid serial,
  procedureid int,
  groupnum int,
  code varchar(100),
  qualifier varchar(200),
  sort_order int,

  CONSTRAINT PK_procedure_default_codes PRIMARY KEY (rowid)
);

CREATE TABLE ehr_lookups.procedure_default_charges (
  rowid serial,
  chargeid int,
  quantity double precision,

  CONSTRAINT PK_procedure_default_charges PRIMARY KEY (rowid)
);

CREATE TABLE ehr_lookups.procedure_default_treatments (
  rowid serial,
  code varchar(100),
  qualifier varchar(100),
  volume double precision,
  volume_units varchar(100),
  dosage double precision,
  dosage_units varchar(100),
  concentration double precision,
  concentration_units varchar(100),
  amount double precision,
  amount_units varchar(100),
  route varchar(100),
  frequency int,

  CONSTRAINT PK_procedure_default_treatments PRIMARY KEY (rowid)
);