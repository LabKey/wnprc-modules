/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--removed after monitoring usage on site
DROP INDEX ehr.encounter_summaries_parentid;
DROP INDEX ehr.encounter_summaries_parentid_objectid_container_id;
DROP INDEX ehr.encounter_summaries_objectid;

CREATE INDEX encounter_summaries_taskid ON ehr.encounter_summaries (taskid);

DROP INDEX ehr.encounter_participants_objectid;

DROP INDEX ehr.snomed_tags_id_recordid_code;
DROP INDEX ehr.snomed_tags_id;
DROP INDEX ehr.snomed_tags_recordid;
DROP INDEX ehr.snomed_tags_recordid_container_code;