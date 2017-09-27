/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
EXEC core.fn_dropifexists 'snomed', 'ehr_lookups', 'CONSTRAINT', 'PK_snomed';
ALTER TABLE ehr_lookups.snomed ADD rowid int identity(1,1);

GO
ALTER TABLE ehr_lookups.snomed ADD CONSTRAINT pk_snomed PRIMARY KEY (rowid);
