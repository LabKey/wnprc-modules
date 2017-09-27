/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE ehr_lookups.labwork_services ADD datedisabled datetime;

UPDATE ehr_lookups.divider_types SET divider = 'Cage Wall (Solid)' WHERE divider = 'Cage Well (Solid)';

insert into ehr_lookups.divider_types (divider, countAsSeparate, countAsPaired, displaychar, bgcolor, border_style, short_description, isMoveable)
select 'Feeder Slide', countAsSeparate, countAsPaired, displaychar, bgcolor, border_style, short_description, 1 from ehr_lookups.divider_types where divider = 'Solid Divider';