/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.snomed_subsets ADD container entityid;
ALTER TABLE ehr_lookups.snomed_subsets ADD rowid serial;

SELECT core.fn_dropifexists('snomed_subsets', 'ehr_lookups', 'CONSTRAINT', 'PK_snomed_subsets');
ALTER TABLE ehr_lookups.snomed_subsets ADD CONSTRAINT pk_snomed_subsets PRIMARY KEY (rowid);

--upgrade path for WNPRC
UPDATE ehr_lookups.snomed_subsets SET container = (SELECT c.entityid from core.containers c LEFT JOIN core.Containers c2 on (c.Parent = c2.EntityId) WHERE c.name = 'EHR' and c2.name = 'WNPRC');
DELETE FROM ehr_lookups.snomed_subsets WHERE container IS NULL;

INSERT INTO ehr_lookups.labwork_types (type, tablename) VALUES ('Misc Tests', 'misc_tests');