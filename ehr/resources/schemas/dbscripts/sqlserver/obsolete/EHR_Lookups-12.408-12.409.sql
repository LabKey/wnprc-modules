/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
alter table ehr_lookups.divider_types add datedisabled datetime;
alter table ehr_lookups.divider_types add isMoveable bit default 1;
GO
update ehr_lookups.divider_types set isMoveable = 1;
update ehr_lookups.divider_types set divider = 'No Divider' WHERE divider =  'Pairing Divider (No Divider)';
update ehr_lookups.divider_types set datedisabled = CURRENT_TIMESTAMP where divider = 'Pairing Mesh Divider';

alter table ehr_lookups.cage_type add abbreviation varchar(100);
GO
update ehr_lookups.cage_type  set abbreviation = 'TU' WHERE cagetype like '%Tunnel%';
update ehr_lookups.cage_type  set abbreviation = 'T' WHERE cagetype like '%T';

insert into ehr_lookups.divider_types (divider, countAsSeparate, countAsPaired, displaychar, bgcolor, border_style, short_description, isMoveable)
select 'Cage Wall (Solid)', countAsSeparate, countAsPaired, displaychar, bgcolor, border_style, short_description, 0 from ehr_lookups.divider_types where divider = 'Solid Divider';