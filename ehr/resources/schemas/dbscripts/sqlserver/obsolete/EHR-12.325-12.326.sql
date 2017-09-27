/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DROP INDEX snomed_tags_objectid ON ehr.snomed_tags;
ALTER TABLE ehr.snomed_tags ALTER COLUMN objectid varchar(60);
CREATE INDEX snomed_tags_objectid ON ehr.snomed_tags (objectid);

DROP INDEX encounter_flags_objectid ON ehr.encounter_flags;
ALTER TABLE ehr.encounter_flags ALTER COLUMN objectid varchar(60);
CREATE INDEX encounter_flags_objectid ON ehr.encounter_flags (objectid);

DROP INDEX encounter_participants_objectid ON ehr.encounter_participants;
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid varchar(60);
CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);

DROP INDEX encounter_summaries_objectid ON ehr.encounter_summaries;
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid varchar(60);
CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);