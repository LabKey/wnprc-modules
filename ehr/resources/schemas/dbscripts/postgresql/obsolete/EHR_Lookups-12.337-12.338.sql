/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--implemented based on SQLServer database engine tuning monitor
CREATE INDEX cage_cagetype_room_cage ON ehr_lookups.cage (cage_type, room, cage);
CREATE INDEX cage_cagetype_room_cage_divider_type ON ehr_lookups.cage (room, cage, divider, cage_type);