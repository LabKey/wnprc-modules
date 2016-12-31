/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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
