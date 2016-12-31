/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
truncate table ehr.encounter_participants;

--this might have been created by EHRManager
SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'INDEX', 'encounter_participants_objectid');

ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid SET NOT NULL;

SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'CONSTRAINT', 'pk_encounter_participants');

ALTER TABLE ehr.encounter_participants ADD CONSTRAINT pk_encounter_participants PRIMARY KEY (objectid);

SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'INDEX', 'encounter_participants_container_rowid_id');
SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'INDEX', 'encounter_participants_container_rowid_parentid');

ALTER TABLE ehr.encounter_participants DROP COLUMN rowid;

