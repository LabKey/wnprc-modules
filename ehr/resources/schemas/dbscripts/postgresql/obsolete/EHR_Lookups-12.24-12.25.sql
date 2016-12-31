/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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

