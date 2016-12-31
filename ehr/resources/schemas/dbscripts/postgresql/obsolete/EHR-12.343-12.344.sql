/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE INDEX encounter_participants_container_rowid_id ON ehr.encounter_participants (container, rowid, id);
CREATE INDEX encounter_participants_container_rowid_parentid ON ehr.encounter_participants (container, rowid, parentid);

CREATE INDEX encounter_summaries_parentid_rowid_container_id ON ehr.encounter_summaries (parentid, rowid, container, id);
CREATE INDEX encounter_summaries_container_rowid ON ehr.encounter_summaries (container, rowid);
CREATE INDEX encounter_summaries_container_parentid ON ehr.encounter_summaries (container, parentid);

CREATE INDEX snomed_tags_recordid_rowid_id ON ehr.snomed_tags (recordid, rowid, id);
CREATE INDEX snomed_tags_code_rowid_id_recordid ON ehr.snomed_tags (code, rowid, id, recordid);
