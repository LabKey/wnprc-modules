/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this might have been created by EHRManager
EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'index', 'encounter_summaries_objectid';
EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'index', 'encounter_summaries_parentid_rowid_container_id';
EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'index', 'encounter_summaries_container_rowid';
EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'constraint', 'PK_encounter_summaries';
GO

ALTER TABLE ehr.encounter_summaries ADD taskid entityid;
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid VARCHAR(60) NOT NULL;
GO
ALTER TABLE ehr.encounter_summaries ADD CONSTRAINT PK_encounter_summaries PRIMARY KEY (objectid);
GO
ALTER TABLE ehr.encounter_summaries DROP COLUMN rowid;
