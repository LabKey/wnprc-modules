/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

select * from (

SELECT

a.id,
a.status as StatusFromDemographicsTable,
a.calculated_status as CalculatedStatus,
a.birth as BirthFromDemographicsTable,
a.id.dataset.birth.date as BirthFromBirthTable,
a.death as DeathFromDemographicsTable,
a.id.dataset.deaths.date as DeathFromDeathTable,
a.id.MostRecentArrival.MostRecentArrival as MostRecentArrival,
a.id.MostRecentDeparture.MostRecentDeparture as MostRecentDeparture,

CASE
  WHEN
    (a.created IS NULL)
    THEN 'No Information'
  WHEN
    (a.id.dataset.birth.date IS NULL AND a.id.MostRecentArrival.MostRecentArrival IS NULL)
    THEN 'Never at Center'
  WHEN
    (a.death IS NOT NULL)
    THEN 'Dead'
  WHEN
    (a.id.MostRecentDeparture.MostRecentDeparture IS NOT NULL AND (a.id.MostRecentArrival.MostRecentArrival IS NULL OR a.id.MostRecentDeparture.MostRecentDeparture > a.id.MostRecentArrival.MostRecentArrival))
    THEN 'Shipped'
  WHEN
    (a.id.dataset.birth.date IS NOT NULL OR a.id.MostRecentArrival.MostRecentArrival IS NOT NULL) AND (a.id.MostRecentDeparture.MostRecentDeparture IS NULL OR a.id.MostRecentDeparture.MostRecentDeparture < a.id.MostRecentArrival.MostRecentArrival)
    THEN 'Alive'
  ELSE
    'ERROR'
END as suggested_status,

FROM study.demographics a

) a

WHERE

(
--a.calculated_status is null

--OR

(a.StatusFromDemographicsTable like 'Alive' AND a.CalculatedStatus != 'Alive')

OR

(a.StatusFromDemographicsTable like 'Dead' AND a.CalculatedStatus != 'Dead')

OR

(a.DeathFromDeathTable is not null AND a.CalculatedStatus != 'Dead')

OR

(a.StatusFromDemographicsTable like 'Shipped' AND a.CalculatedStatus != 'Shipped' and a.DeathFromDemographicsTable is null)

OR

a.CalculatedStatus = 'No Record At Center'

OR

a.CalculatedStatus = 'ERROR'
)
