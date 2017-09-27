/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.procedures ADD remark varchar(8000);

ALTER TABLE ehr_lookups.species ADD cites_code varchar(200);