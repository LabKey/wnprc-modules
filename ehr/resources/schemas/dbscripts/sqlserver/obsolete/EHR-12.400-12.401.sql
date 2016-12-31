/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.animal_group_members DROP pk_animal_group_members;
ALTER TABLE ehr.animal_group_members DROP COLUMN rowid;
ALTER TABLE ehr.animal_group_members DROP COLUMN comment;
ALTER TABLE ehr.animal_group_members ADD remark varchar(4000);
ALTER TABLE ehr.animal_group_members ALTER COLUMN objectid entityid NOT NULL;
GO
ALTER TABLE ehr.animal_group_members ADD CONSTRAINT pk_animal_group_members PRIMARY KEY (objectid);