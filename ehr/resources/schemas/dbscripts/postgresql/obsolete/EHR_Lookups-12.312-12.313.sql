/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.lookup_sets ADD keyField varchar(100);
ALTER TABLE ehr_lookups.lookup_sets ADD titleColumn varchar(100);

ALTER TABLE ehr_lookups.lookups ADD title varchar(200);
ALTER TABLE ehr_lookups.lookups ADD description varchar(1000);
DROP table ehr_lookups.integers;
DROP table ehr_lookups.arearooms;
DROP TABLE ehr_lookups.mhc_institutions;

