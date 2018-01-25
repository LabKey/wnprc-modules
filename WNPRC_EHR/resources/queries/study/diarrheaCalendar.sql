/*
 * Copyright (c) 2011-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*
 * This query provides a calendar view of feces to more easily see trends for individual monkeys.
 */

SELECT
fecesobs.Id,
fecesobs.year,
fecesobs.monthName,
fecesobs.monthNum,
fecesobs.day,
group_concat(DISTINCT fecesobs.feces) as feces

FROM (
  SELECT
  obs.Id,
  obs.date,
  convert(year(obs.date), integer) as year,
  monthname(obs.date) AS monthName,
  convert(month(obs.date), integer) AS monthNum,
  convert(dayofmonth(obs.date), integer) as day,
  obs.feces
  FROM study."Irregular Obs No Okays" obs
  WHERE obs.feces IS NOT NULL
) fecesobs

GROUP BY fecesobs.id, fecesobs.year, fecesobs.monthName, fecesobs.monthNum, fecesobs.day
PIVOT feces BY day