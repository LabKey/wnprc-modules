/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* EHR_Lookups-12.20-12.21.sql */

ALTER TABLE ehr_lookups.snomed_subsets DROP container;

/* EHR_Lookups-12.21-12.22.sql */

CREATE TABLE ehr_lookups.charge_flags (
    rowid SERIAL NOT NULL,
    shortName varchar(100),
    description varchar(4000),

    createdBy USERID,
    created TIMESTAMP,
    modifiedBy USERID,
    modified TIMESTAMP,

    CONSTRAINT PK_charge_flags PRIMARY KEY (RowId)
);

CREATE TABLE ehr_lookups.account_tiers (
    rowid SERIAL NOT NULL,
    meaning varchar(200),
    multiplier double precision,

    createdBy USERID,
    created TIMESTAMP,
    modifiedBy USERID,
    modified TIMESTAMP,

    CONSTRAINT PK_account_tiers PRIMARY KEY (rowid)
);

/* EHR_Lookups-12.22-12.23.sql */

ALTER TABLE ehr_lookups.areas ADD column description varchar(500);

CREATE TABLE ehr_lookups.usda_levels (
    usda_level varchar(100),

    constraint pk_usda_levels primary key (usda_level)
);

INSERT INTO ehr_lookups.usda_levels (usda_level) VALUES ('A');
INSERT INTO ehr_lookups.usda_levels (usda_level) VALUES ('B');
INSERT INTO ehr_lookups.usda_levels (usda_level) VALUES ('C');
INSERT INTO ehr_lookups.usda_levels (usda_level) VALUES ('D');
INSERT INTO ehr_lookups.usda_levels (usda_level) VALUES ('None');


CREATE TABLE ehr_lookups.project_types (
    type varchar(100),
    multiplier double precision,

    constraint pk_project_types primary key (type)
);

INSERT INTO ehr_lookups.project_types (type) VALUES ('Federal');
INSERT INTO ehr_lookups.project_types (type) VALUES ('Contract');
INSERT INTO ehr_lookups.project_types (type) VALUES ('Other');


CREATE TABLE ehr_lookups.source
(
  code VARCHAR(255) NOT NULL,
  meaning VARCHAR(255) DEFAULT NULL,
  CONSTRAINT pk_source PRIMARY KEY (code )
);

insert into ehr_lookups.source
  select code, meaning FROM ehr_lookups.origin_codes;

drop table ehr_lookups.origin_codes;

ALTER table ehr_lookups.source
  add SourceCity varchar(200),
  add SourceState varchar(200),
  add SourceCountry varchar(200)
;


DELETE FROM ehr_lookups.birth_type WHERE type = 'c';
INSERT INTO ehr_lookups.birth_type VALUES ('c', 'C-Section');
DELETE FROM ehr_lookups.birth_type WHERE type = 'n';
INSERT INTO ehr_lookups.birth_type VALUES ('n', 'Natural');
DELETE FROM ehr_lookups.birth_type WHERE type = 'o';
INSERT INTO ehr_lookups.birth_type VALUES ('o', 'Other');


--INSERT INTO ehr_lookups.birth_type (type, meaning) VALUES ('Fetal ID Assigned');
INSERT INTO ehr_lookups.birth_type (type, meaning) VALUES ('fr', 'No Delivery - Fetus Recovered');
INSERT INTO ehr_lookups.birth_type (type, meaning) VALUES ('fa', 'No Delivery - Fetus Resorbed');
INSERT INTO ehr_lookups.birth_type (type, meaning) VALUES ('nr', 'Fetus Not Recovered');


CREATE TABLE ehr_lookups.birth_condition (
    rowid serial,
    meaning varchar(100),

    constraint pk_birth_condition primary key (rowid)
);

INSERT INTO ehr_lookups.birth_condition (meaning) VALUES ('Live Birth');
INSERT INTO ehr_lookups.birth_condition (meaning) VALUES ('Born Dead');
INSERT INTO ehr_lookups.birth_condition (meaning) VALUES ('Terminated At Birth');
INSERT INTO ehr_lookups.birth_condition (meaning) VALUES ('Incomplete Birth Info');

/* EHR_Lookups-12.24-12.25.sql */

DROP TABLE ehr_lookups.snomed_subsets;
CREATE TABLE ehr_lookups.snomed_subsets(
  subset VARCHAR(255) NOT NULL,
  createdby userid,
  created timestamp,
  modifiedby userid,
  modified timestamp,
  CONSTRAINT pk_snomed_subsets PRIMARY KEY (subset)
);

INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Antibiotic');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Bacteriology Results');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Culture Source');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Distribution');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Drugs and Procedures');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Duration');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Etiology');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Inflammation');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Organisms');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Organ/Tissue');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Parasitology Results');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Procedures');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Process/Disorder');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Severity Codes');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Treatment Codes');
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Viral Challenges');

/* EHR_Lookups-12.26-12.27.sql */

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

/* EHR_Lookups-12.28-12.29.sql */

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