/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.tasks ADD billingType int;

alter table ehr.project add name varchar(100);
alter table ehr.project add investigatorId int;

alter table ehr.protocol add investigatorId int;