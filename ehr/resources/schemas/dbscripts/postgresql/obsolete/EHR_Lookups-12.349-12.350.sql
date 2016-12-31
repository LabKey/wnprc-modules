/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.flag_categories ADD omitFromOverview bool default false;
ALTER TABLE ehr_lookups.flag_categories ADD doHighlight bool default false;

INSERT INTO ehr_lookups.flag_categories (category, enforceUnique, omitFromOverview) values ('Genetics', false, true);
UPDATE ehr_lookups.flag_categories set doHighlight = false;
UPDATE ehr_lookups.flag_categories set doHighlight = true WHERE category = 'Alert';