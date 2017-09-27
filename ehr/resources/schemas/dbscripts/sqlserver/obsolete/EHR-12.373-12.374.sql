/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);
CREATE INDEX encounter_summaries_parentid_objectid_container_id ON ehr.encounter_summaries (parentid, objectid, container, id);
CREATE INDEX encounter_summaries_container_objectid ON ehr.encounter_summaries (container, objectid);

CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);
CREATE INDEX encounter_participants_taskid ON ehr.encounter_participants (taskid);

CREATE INDEX snomed_tags_taskid ON ehr.snomed_tags (taskid);

