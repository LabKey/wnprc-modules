/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DROP INDEX encounter_encounter_participants_id ON ehr.encounter_participants;
CREATE INDEX encounter_participants_id ON ehr.encounter_participants (id);