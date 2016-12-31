/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this might have been created by EHRManager
SELECT core.fn_dropifexists('encounter_summaries', 'ehr', 'index', 'encounter_summaries_objectid');
SELECT core.fn_dropifexists('encounter_summaries', 'ehr', 'index', 'encounter_summaries_parentid_rowid_container_id');
SELECT core.fn_dropifexists('encounter_summaries', 'ehr', 'index', 'encounter_summaries_container_rowid');
SELECT core.fn_dropifexists('encounter_summaries', 'ehr', 'constraint', 'PK_encounter_summaries');

ALTER TABLE ehr.encounter_summaries ADD taskid entityid;
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid SET NOT NULL;

ALTER TABLE ehr.encounter_summaries ADD CONSTRAINT PK_encounter_summaries PRIMARY KEY (objectid);
ALTER TABLE ehr.encounter_summaries DROP COLUMN rowid;
