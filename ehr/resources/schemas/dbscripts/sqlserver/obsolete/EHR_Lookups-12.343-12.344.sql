/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--NOTE: this is only created on SQLServer since PG doesnt support INCLUDE
CREATE INDEX snomed_code_include_meaning ON ehr_lookups.snomed (code) INCLUDE (meaning);


