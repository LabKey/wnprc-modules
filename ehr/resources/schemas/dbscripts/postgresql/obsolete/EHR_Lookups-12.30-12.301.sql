/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.procedure_default_comments (
  rowid serial,
  procedureid int,
  comment varchar(4000),

  CONSTRAINT PK_procedure_default_comments PRIMARY KEY (rowid)
);

CREATE TABLE ehr_lookups.procedure_default_flags (
  rowid serial,
  procedureid int,
  flag varchar(200),
  value varchar(200),

  CONSTRAINT PK_procedure_default_flags PRIMARY KEY (rowid)
);

ALTER TABLE ehr_lookups.procedure_default_charges ADD COLUMN procedureid int;
ALTER TABLE ehr_lookups.procedure_default_treatments ADD COLUMN procedureid int;

ALTER TABLE ehr_lookups.procedures ADD COLUMN active boolean;
ALTER TABLE ehr_lookups.procedures DROP COLUMN "procedure";
ALTER TABLE ehr_lookups.procedures ADD COLUMN name varchar(200);

CREATE TABLE ehr_lookups.disallowed_medications (
  rowid serial,
  code1 varchar(100),
  code2 varchar(100),

  CONSTRAINT PK_disallowed_medications PRIMARY KEY (rowid)
);

INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-85365', 'E-YY535');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-85361', 'E-YY535');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-85361', 'E-77720');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-85361', 'E-YYY40');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-85365', 'E-YYY40');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-85365', 'E-77720');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-85365', 'E-779X0');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-85361', 'E-779X0');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-YY973', 'E-71900');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-85361', 'E-85361');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-85365', 'E-85365');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-YY973', 'E-YY973');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-779X0', 'E-YY535');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-779X0', 'E-779X0');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-779X0', 'E-77720');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-779X0', 'E-YYY40');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-YYY30', 'E-YY973');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-72500', 'E-YY973');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-77720', 'E-YY535');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-YYY40', 'E-YY535');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-721X0', 'E-YY270');
INSERT INTO ehr_lookups.disallowed_medications (code1, code2) VALUEs ('E-721X0', 'E-72170');
