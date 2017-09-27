/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.procedures ADD genericName varchar(200);
ALTER TABLE ehr_lookups.procedures ADD incision bool default false;
ALTER TABLE ehr_lookups.procedures ADD recoveryDays integer;
ALTER TABLE ehr_lookups.procedures ADD followupDays integer;

ALTER TABLE ehr_lookups.procedures ADD analgesiaRx integer;
ALTER TABLE ehr_lookups.procedures ADD antibioticRx integer;


