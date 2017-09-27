/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--removed after monitoring usage on site
DROP INDEX encounter_summaries_parentid ON ehr.encounter_summaries;
DROP INDEX encounter_summaries_parentid_objectid_container_id ON ehr.encounter_summaries;
DROP INDEX encounter_summaries_objectid ON ehr.encounter_summaries;

CREATE INDEX encounter_summaries_taskid ON ehr.encounter_summaries (taskid);

DROP INDEX encounter_participants_objectid ON ehr.encounter_participants;

DROP INDEX snomed_tags_id_recordid_code ON ehr.snomed_tags;
DROP INDEX snomed_tags_id ON ehr.snomed_tags;
DROP INDEX snomed_tags_recordid ON ehr.snomed_tags;
DROP INDEX snomed_tags_recordid_container_code ON ehr.snomed_tags;