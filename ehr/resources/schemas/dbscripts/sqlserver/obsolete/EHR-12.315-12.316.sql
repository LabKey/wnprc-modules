/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.snomed_tags ADD set_number int default 1;
go
update ehr.snomed_tags set set_number = 1 where set_number is null;