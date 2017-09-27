/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr.snomed_tags DROP PK_snomed_tags;
DROP INDEX snomed_tags_recordid_rowid_id ON ehr.snomed_tags;
DROP INDEX snomed_tags_code_rowid_id_recordid ON ehr.snomed_tags;
DROP INDEX snomed_tags_parentid ON ehr.snomed_tags;
DROP INDEX snomed_tags_caseid ON ehr.snomed_tags;
DROP INDEX snomed_tags_objectid on ehr.snomed_tags;

GO
ALTER TABLE ehr.snomed_tags DROP COLUMN rowid;
ALTER TABLE ehr.snomed_tags DROP COLUMN parentid;
ALTER TABLE ehr.snomed_tags DROP COLUMN caseid;
ALTER TABLE ehr.snomed_tags DROP COLUMN schemaName;
ALTER TABLE ehr.snomed_tags DROP COLUMN queryName;
ALTER TABLE ehr.snomed_tags ALTER COLUMN objectid varchar(60) NOT NULL;
GO
CREATE INDEX snomed_tags_objectid on ehr.snomed_tags (objectid);
ALTER TABLE ehr.snomed_tags ADD CONSTRAINT PK_snomed_tags PRIMARY KEY NONCLUSTERED (objectid);