/*
 * Copyright (c) 2013-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.divider_types ADD bgcolor varchar(100);
ALTER TABLE ehr_lookups.divider_types ADD border_style varchar(100);
ALTER TABLE ehr_lookups.divider_types ADD short_description varchar(100);

--UPDATE ehr_lookups.divider_types SET bgcolor = '' WHERE divider = 'Solid Divider';
UPDATE ehr_lookups.divider_types SET border_style = 'solid' WHERE divider = 'Solid Divider';
UPDATE ehr_lookups.divider_types SET short_description = '' WHERE divider = 'Solid Divider';
UPDATE ehr_lookups.divider_types SET displaychar = '|' WHERE divider = 'Solid Divider';

UPDATE ehr_lookups.divider_types SET bgcolor = 'yellow' WHERE divider = 'Grooming Divider';
UPDATE ehr_lookups.divider_types SET border_style = 'dashed' WHERE divider = 'Grooming Divider';
UPDATE ehr_lookups.divider_types SET short_description = 'GROOM' WHERE divider = 'Grooming Divider';
UPDATE ehr_lookups.divider_types SET displaychar = '=' WHERE divider = 'Grooming Divider';

UPDATE ehr_lookups.divider_types SET bgcolor = 'grey' WHERE divider = 'Mesh Divider';
UPDATE ehr_lookups.divider_types SET border_style = 'dotted' WHERE divider = 'Mesh Divider';
UPDATE ehr_lookups.divider_types SET short_description = 'MESH' WHERE divider = 'Mesh Divider';
UPDATE ehr_lookups.divider_types SET displaychar = '#' WHERE divider = 'Mesh Divider';

--UPDATE ehr_lookups.divider_types SET bgcolor = '' WHERE divider = 'Pairing Divider (No Divider)';
UPDATE ehr_lookups.divider_types SET border_style = 'none' WHERE divider = 'Pairing Divider (No Divider)';
UPDATE ehr_lookups.divider_types SET short_description = '' WHERE divider = 'Pairing Divider (No Divider)';
--UPDATE ehr_lookups.divider_types SET displaychar = '' WHERE divider = 'Pairing Divider (No Divider)';

UPDATE ehr_lookups.divider_types SET bgcolor = 'grey' WHERE divider = 'Pairing Mesh Divider';
UPDATE ehr_lookups.divider_types SET border_style = 'solid' WHERE divider = 'Pairing Mesh Divider';
UPDATE ehr_lookups.divider_types SET short_description = 'MESH' WHERE divider = 'Pairing Mesh Divider';
UPDATE ehr_lookups.divider_types SET displaychar = '#' WHERE divider = 'Pairing Mesh Divider';