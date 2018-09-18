/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

select
c.room.area as area,
c.room,
CASE
  WHEN (count(o.id) + count(co.room)) = 0 THEN  'N'
  else 'Y'
end as hasObs

from study.ActiveHousing c

left join study.obs o ON (o.Id.curLocation.room = c.room and cast(o.date as date) = cast(now() as date))
left join ehr.cage_observations co ON (co.room = c.room and cast(co.date as date) = cast(now() as date))

group by c.room.area, c.room