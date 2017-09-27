/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.snomed_tags ADD formsort integer;
ALTER TABLE ehr.snomed_tags ADD date timestamp;
ALTER TABLE ehr.encounter_summaries ADD formsort integer;
ALTER TABLE ehr.encounter_participants ADD formsort integer;

ALTER TABLE ehr.formtemplates ADD hidden bit default 0;
GO
UPDATE ehr.formtemplates SET hidden = 0;
