/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
UPDATE ehr_lookups.lookups SET set_name = 'housingDefinition' WHERE set_name = 'LocationDefinition';
UPDATE ehr_lookups.lookups SET set_name = 'housingTypes' WHERE set_name = 'LocationType';
