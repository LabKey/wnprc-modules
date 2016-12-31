/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.project DROP CONSTRAINT PK_project;
ALTER TABLE ehr.protocol DROP CONSTRAINT PK_protocol;

ALTER TABLE ehr.project ALTER COLUMN objectid TYPE entityid;
ALTER TABLE ehr.protocol ALTER COLUMN objectid TYPE entityid;

ALTER TABLE ehr.project ADD CONSTRAINT PK_project PRIMARY KEY (objectid);
ALTER TABLE ehr.protocol ADD CONSTRAINT PK_protocol PRIMARY KEY (objectid);
