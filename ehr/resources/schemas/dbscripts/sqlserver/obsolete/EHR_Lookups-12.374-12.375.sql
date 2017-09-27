/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE INDEX snomed_code_container ON ehr_lookups.snomed (code, container);
CREATE INDEX snomed_subset_codes_container_code ON ehr_lookups.snomed_subset_codes (container, code);
CREATE INDEX snomed_subset_codes_container_primarycategory ON ehr_lookups.snomed_subset_codes (container, primarycategory);
