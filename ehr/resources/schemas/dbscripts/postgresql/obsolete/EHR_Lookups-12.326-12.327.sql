/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.labwork_types (
  type varchar(100) NOT NULL,
  tableName varchar(100),

  CONSTRAINT PK_labwork_types PRIMARY KEY (type)
);

CREATE TABLE ehr_lookups.lab_tests (
  rowid serial,
  type varchar(100),
  testid varchar(100) NOT NULL,
  name varchar(100),
  units varchar(100),
  aliases varchar(1000),
  alertOnAbnormal boolean,
  alertOnAny boolean,
  includeInPanel boolean,
  sort_order int,

  CONSTRAINT PK_lab_tests PRIMARY KEY (rowid)
);

--biochemistry
INSERT INTO ehr_lookups.labwork_types (type, tablename) VALUES ('Biochemistry', 'chemistry_tests');
INSERT INTO ehr_lookups.lab_tests (type, testid, name, units, aliases, alertOnAbnormal, alertOnAny, includeInPanel, sort_order)
SELECT 'Biochemistry', testid, name, units, aliases, alertOnAbnormal, alertOnAny, includeInPanel, sort_order
FROM ehr_lookups.chemistry_tests;

DROP TABLE ehr_lookups.chemistry_tests;

--hematology
INSERT INTO ehr_lookups.labwork_types (type, tablename) VALUES ('Hematology', 'hematology_tests');
INSERT INTO ehr_lookups.lab_tests (type, testid, name, units, alertOnAbnormal, alertOnAny, includeInPanel, sort_order)
SELECT 'Hematology', testid, name, units, alertOnAbnormal, alertOnAny, includeInPanel, sort_order
FROM ehr_lookups.hematology_tests;

DROP TABLE ehr_lookups.hematology_tests;

--cytology
INSERT INTO ehr_lookups.labwork_types (type, tablename) VALUES ('Cytology', 'cytology_tests');
INSERT INTO ehr_lookups.lab_tests (type, testid, name, units, alertOnAbnormal, alertOnAny, includeInPanel, sort_order)
SELECT 'Cytology', testid, name, units, alertOnAbnormal, alertOnAny, includeInPanel, sort_order
FROM ehr_lookups.cytology_tests;

DROP TABLE ehr_lookups.cytology_tests;

--immunology
INSERT INTO ehr_lookups.labwork_types (type, tablename) VALUES ('Immunology', 'immunology_tests');
INSERT INTO ehr_lookups.lab_tests (type, testid, name, units, alertOnAbnormal, alertOnAny, includeInPanel, sort_order)
SELECT 'Immunology', testid, name, units, alertOnAbnormal, alertOnAny, includeInPanel, sort_order
FROM ehr_lookups.immunology_tests;

DROP TABLE ehr_lookups.immunology_tests;

--urinalysis
INSERT INTO ehr_lookups.labwork_types (type, tablename) VALUES ('Urinalysis', 'urinalysis_tests');
INSERT INTO ehr_lookups.lab_tests (type, testid, name, units, alertOnAbnormal, alertOnAny, includeInPanel, sort_order)
SELECT 'Urinalysis', testid, name, units, alertOnAbnormal, alertOnAny, includeInPanel, sort_order
FROM ehr_lookups.urinalysis_tests;

DROP TABLE ehr_lookups.urinalysis_tests;

--virology
INSERT INTO ehr_lookups.labwork_types (type, tablename) VALUES ('Virology', 'virology_tests');
INSERT INTO ehr_lookups.lab_tests (type, testid, alertOnAbnormal, alertOnAny, includeInPanel, sort_order)
SELECT 'Virology', testid, alertOnAbnormal, alertOnAny, includeInPanel, sort_order
FROM ehr_lookups.virology_tests;

DROP TABLE ehr_lookups.virology_tests;

--istat
INSERT INTO ehr_lookups.labwork_types (type, tablename) VALUES ('iStat', 'istat_tests');

INSERT INTO ehr_lookups.lookups (set_name, value) VALUES ('clinpath_types', 'iSTAT');