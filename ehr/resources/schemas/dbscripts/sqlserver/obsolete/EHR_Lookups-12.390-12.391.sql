/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.procedures DROP COLUMN analgesiaRx;
ALTER TABLE ehr_lookups.procedures DROP COLUMN antibioticRx;
GO
ALTER TABLE ehr_lookups.procedures ADD analgesiaRx varchar(200);
ALTER TABLE ehr_lookups.procedures ADD antibioticRx varchar(200);