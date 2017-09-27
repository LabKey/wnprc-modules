/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DROP INDEX ehr.snomed_tags_objectid;
ALTER TABLE ehr.snomed_tags ALTER COLUMN objectid TYPE varchar(60);
CREATE INDEX snomed_tags_objectid ON ehr.snomed_tags (objectid);

DROP INDEX ehr.encounter_flags_objectid;
ALTER TABLE ehr.encounter_flags ALTER COLUMN objectid TYPE varchar(60);
CREATE INDEX encounter_flags_objectid ON ehr.encounter_flags (objectid);

DROP INDEX ehr.encounter_participants_objectid;
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid TYPE varchar(60);
CREATE INDEX encounter_participants_objectid ON ehr.encounter_participants (objectid);

DROP INDEX ehr.encounter_summaries_objectid;
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid TYPE varchar(60);
CREATE INDEX encounter_summaries_objectid ON ehr.encounter_summaries (objectid);