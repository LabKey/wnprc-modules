/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.animal_groups ADD container entityid;
ALTER TABLE ehr.animal_groups ADD date datetime;
ALTER TABLE ehr.animal_groups ADD enddate datetime;
ALTER TABLE ehr.animal_groups ADD objectid entityid;
ALTER TABLE ehr.animal_groups ADD purpose varchar(4000);
ALTER TABLE ehr.animal_groups ADD comment text;

ALTER TABLE ehr.animal_group_members ADD id varchar(200);

ALTER TABLE ehr.animal_group_members DROP COLUMN groupname;
ALTER TABLE ehr.animal_group_members ADD groupId int;