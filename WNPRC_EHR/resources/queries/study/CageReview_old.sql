/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
  c.location,
  c.room,
  c.cage,
  c.jointocage,
  c.cagesCounted,
  c.JoinedCage,

  c.TotalAnimalsOver5Months,
  c.animals,
  c.Availabilities,
  c.TotalAnimals5Months,
  c.Animals5Mo,
  c.HeaviestWeight,
  c.weights,
  c.ReqSqFts,
  round(c.sqft*c.cagesCounted, 1) as CageSqft,
  round(c.ReqSqFt, 1) as ReqSqFt,

  c.height as CageHeight,
  c.ReqHeight,

  CASE WHEN c.sqft*c.cagesCounted <  c.ReqSqft
    THEN 'Too Small'
    ELSE null
  END as sizeStatus,

  CASE WHEN c.height < c.ReqHeight
    THEN 'Too Short'
    ELSE null
  END as heightStatus,

  CASE WHEN c.height < c.ReqHeight OR c.sqft*c.cagesCounted <  c.ReqSqft
    THEN 'ERROR'
    ELSE 'OK'
  END as cageStatus

FROM (

SELECT
  c.roomcage as location,
  c.room,
  c.cage,
  c.jointocage,
  c.roomcage.height as height,
  ((c.roomcage.length * c.roomcage.width)/144) as sqft,
  h.ReqHeight,
  h.ReqSqFt,

  CASE
    WHEN h2.TotalAnimals IS NULL AND c2.cage is not null THEN 2
    ELSE 1
  END CagesCounted,
  CASE
    WHEN h2.TotalAnimals IS NULL THEN c2.cage
    ELSE NULL
  END JoinedCage,
  h2.TotalAnimals as OccupantsInJoinedCage,

  h.TotalAnimalsOver5Months,
  h3.TotalAnimals5Months,
  h.Animals,
  h.Availabilities,
  h3.Animals5Mo,
  h.HeaviestWeight,
  h.weights,
  h.ReqSqFts,

FROM ehr_lookups.cages c

LEFT JOIN (
  SELECT
    h.room,
    h.cage,
    count(DISTINCT h.id) as TotalAnimalsOver5Months,
    group_concat(h.id) as Animals,
    group_concat(h.id.activeAssignments.Availability) as Availabilities,
    sum(c1.sqft) as ReqSqFt,
    group_concat(c1.sqft) as ReqSqFts,
    max(c1.height) as ReqHeight,
    max(h.Id.mostRecentWeight.mostRecentWeight) as HeaviestWeight,
    group_concat(h.Id.mostRecentWeight.mostRecentWeight) as Weights,
    FROM study.housing h
    LEFT JOIN ehr_lookups.cageclass c1
    ON (c1.low <= h.Id.mostRecentWeight.mostRecentWeight AND h.Id.mostRecentWeight.mostRecentWeight < c1.high)
    WHERE h.enddate IS NULL
    AND h.id.age.ageInMonths >= 5.0
    GROUP BY h.room, h.cage
  ) h
  ON (c.room=h.room AND c.cage=h.cage)

LEFT JOIN (
  SELECT
    h.room,
    h.cage,
    count(DISTINCT h.id) as TotalAnimals5Months,
    group_concat(h.id) as Animals5Mo,
    FROM study.housing h
    WHERE h.enddate IS NULL
    AND h.id.age.ageInMonths = 5.0
    GROUP BY h.room, h.cage
  ) h3
  ON (c.room=h3.room AND c.cage=h3.cage)

LEFT JOIN ehr_lookups.cages c2
  ON (c.joinToCage IS NOT NULL AND c.room=c2.room and c2.cage LIKE c.joinToCage)

LEFT JOIN (
  SELECT
    h.room,
    h.cage,
    count(DISTINCT h.id) as TotalAnimals,
    --null as TotalAnimals
    FROM study.housing h
    WHERE h.enddate IS NULL

    GROUP BY h.room, h.cage
  ) h2
  ON (c.room=h2.room AND h2.cage LIKE c.joinToCage)

WHERE h.TotalAnimalsOver5Months is not null

) c

