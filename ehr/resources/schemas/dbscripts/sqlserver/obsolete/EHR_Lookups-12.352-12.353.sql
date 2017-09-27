/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.cage_type ADD verticalSlots integer;
GO
UPDATE ehr_lookups.cage_type SET verticalSlots = 1;
UPDATE ehr_lookups.cage_type SET verticalSlots = 2 WHERE cagetype LIKE 'Tunnel - %';