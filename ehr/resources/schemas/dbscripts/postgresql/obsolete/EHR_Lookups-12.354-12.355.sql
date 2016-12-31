/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.blood_draw_tube_type ADD color varchar(100);

UPDATE ehr_lookups.blood_draw_tube_type SET color = 'Purple' WHERE type = 'EDTA';
UPDATE ehr_lookups.blood_draw_tube_type SET color = 'Green' WHERE type = 'Heparin';
UPDATE ehr_lookups.blood_draw_tube_type SET color = 'Red' WHERE type = 'No Additive';
UPDATE ehr_lookups.blood_draw_tube_type SET color = 'Striped' WHERE type = 'SST';