/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.encounter_participants DROP COLUMN procedure_id;
ALTER TABLE ehr.encounter_participants ADD parentid entityid;

go

CREATE INDEX encounter_flags_objectid ON ehr.encounter_flags (objectid);

CREATE INDEX encounter_flags_parentid ON ehr.encounter_flags (parentid);

CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);

CREATE INDEX encounter_participants_parentid ON ehr.encounter_participants (parentid);

CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);

CREATE INDEX encounter_summaries_parentid ON ehr.encounter_summaries (parentid);

CREATE INDEX snomed_tags_objectid ON ehr.snomed_tags (objectid);

CREATE INDEX snomed_tags_recordid ON ehr.snomed_tags (recordid);