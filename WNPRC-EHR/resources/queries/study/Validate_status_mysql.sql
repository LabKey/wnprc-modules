/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

a.id,

a.status,
a.calculated_status,
a.birth,
a.id.dataset.birth.date as birthTable,
a.death,
a.id.dataset.deaths.date as deathTable,

a.arrivedate,
a.id.MostRecentArrival.MostRecentArrival as MostRecentArrival,

a.departdate,
a.id.MostRecentDeparture.MostRecentDeparture as MostRecentDeparture,


FROM study.demographics a

WHERE a.status is not null AND

(
--a.calculated_status is null

--OR

(a.status like 'Alive' AND a.calculated_status != 'Alive')

OR

(a.status like 'd-%' AND a.calculated_status != 'Dead')

OR

(a.id.dataset.deaths.date is not null AND a.calculated_status != 'Dead')

OR

(a.status like '%shippd%' AND a.calculated_status != 'Shipped' and a.death is null)

OR

a.calculated_status = 'No Record At Center'

OR

a.calculated_status = 'ERROR'
)
--status
--avail