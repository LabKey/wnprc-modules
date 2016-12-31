/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.parentageTypes (
  label varchar(200),
  priority int,
  abbreviation varchar(100)
);

INSERT INTO ehr_lookups.parentageTypes (label, priority, abbreviation) VALUES ('Genetic', 1, 'g');
INSERT INTO ehr_lookups.parentageTypes (label, priority, abbreviation) VALUES ('Observed', 2, 'o');
INSERT INTO ehr_lookups.parentageTypes (label, priority, abbreviation) VALUES ('Foster', 3, 'f');

CREATE TABLE ehr_lookups.relationshipTypes (
  label varchar(200),
  gender varchar(100)
);