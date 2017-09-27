/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.drug_defaults add rowid serial;
ALTER TABLE ehr_lookups.drug_defaults add ageclass varchar(100);

ALTER TABLE ehr_lookups.drug_defaults DROP CONSTRAINT PK_drug_defaults;
ALTER TABLE ehr_lookups.drug_defaults ADD CONSTRAINT PK_drug_defaults PRIMARY KEY (rowid);
