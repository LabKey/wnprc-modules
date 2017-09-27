/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DELETE FROM ehr_lookups.snomed_subsets WHERE subset = 'Diet';
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Diet');