/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.treatment_frequency ADD active bit default 1;
ALTER TABLE ehr_lookups.treatment_frequency DROP COLUMN legacyname;