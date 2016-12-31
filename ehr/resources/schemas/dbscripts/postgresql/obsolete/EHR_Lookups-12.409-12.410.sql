/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE INDEX IDX_snomed_container_code_rowid ON ehr_lookups.snomed (container, code, rowid);