/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DROP INDEX ehr.snomed_tags_id_recordid;

CREATE INDEX snomed_tags_id_recordid_code on ehr.snomed_tags (id, recordid, code);