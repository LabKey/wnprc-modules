/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.drug_defaults add rowid int identity(1,1);
ALTER TABLE ehr_lookups.drug_defaults add ageclass varchar(100);
GO
ALTER TABLE ehr_lookups.drug_defaults DROP CONSTRAINT PK_drug_defaults;
GO
ALTER TABLE ehr_lookups.drug_defaults ADD CONSTRAINT PK_drug_defaults PRIMARY KEY (rowid);
