/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--NOTE: this change is not applied to postgres
ALTER TABLE ehr.snomed_tags DROP PK_snomed_tags;
ALTER TABLE ehr.snomed_tags ADD CONSTRAINT PK_snomed_tags PRIMARY KEY NONCLUSTERED (rowid);

CREATE CLUSTERED INDEX CIDX_snomed_tags ON
  ehr.snomed_tags (container, recordid, set_number, sort)
  --NOTE: free versions of SQLServer do not support compression, so we cannot add this in the upgrade script.
  --WITH (DATA_COMPRESSION = ROW);