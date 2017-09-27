/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.encounter_participants add Id varchar(100);

ALTER TABLE ehr.snomed_tags ADD Id varchar(100);
ALTER TABLE ehr.snomed_tags ADD caseid entityid;
ALTER TABLE ehr.snomed_tags ADD parentid entityid;

GO
CREATE INDEX encounter_flags_id ON ehr.encounter_flags (id);
CREATE INDEX encounter_encounter_participants_id ON ehr.encounter_participants (id);
CREATE INDEX encounter_summaries_id ON ehr.encounter_summaries (id);
CREATE INDEX snomed_tags_id ON ehr.snomed_tags (id);
CREATE INDEX snomed_tags_parentid ON ehr.snomed_tags (parentid);
CREATE INDEX snomed_tags_caseid ON ehr.snomed_tags (caseid);
