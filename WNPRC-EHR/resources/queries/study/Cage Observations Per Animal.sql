/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*
 * This query looks at the intervals that an animal was housed in a certain location and grabs
 * all of the cage observations for that time associates them with the animal Id.
 *
 *        ** NOTE: WITHOUT A FILTER, THIS QUERY COULD TAKE A WHILE TO RUN **
 */

SELECT
housing.Id,
housing.date as inDate,
housing.endDate as outDate,
housing.room.area as area,
cage_obs.*
from study.housing as housing

LEFT JOIN
(
  SELECT * FROM ehr.cage_observations as co
  WHERE (co.cage IS NOT NULL) --Select only cage observations, not room obs
) as cage_obs

ON (
  (cage_obs.cage = housing.cage)
  AND
  (cage_obs.room = housing.room)
  AND (
    (
      (housing.endDate >= cage_obs.date)
      OR
      (housing.endDate IS NULL)
    )
    AND
    (housing.date <= cage_obs.date)
  )
)

WHERE cage_obs.objectid IS NOT NULL