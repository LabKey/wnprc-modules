/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.labwork_services DROP column sampletype;
ALTER TABLE ehr_lookups.labwork_services ADD tissue varchar(100);

ALTER TABLE ehr_lookups.cageclass ADD requirementset varchar(200);
GO
UPDATE ehr_lookups.cageclass SET requirementset = 'The Guide';