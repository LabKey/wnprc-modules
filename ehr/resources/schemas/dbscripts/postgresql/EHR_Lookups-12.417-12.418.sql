/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DROP INDEX ehr_lookups.rooms_sort_order_room;

CREATE INDEX ehr_lookups_set_name_value ON ehr_lookups.lookups (set_name, value);