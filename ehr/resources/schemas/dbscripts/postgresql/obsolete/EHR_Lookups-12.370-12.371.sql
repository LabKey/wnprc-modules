/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT core.fn_dropifexists('snomed', 'ehr_lookups', 'CONSTRAINT', 'PK_snomed');
ALTER TABLE ehr_lookups.snomed ADD rowid SERIAL;

ALTER TABLE ehr_lookups.snomed ADD CONSTRAINT pk_snomed PRIMARY KEY (rowid);
