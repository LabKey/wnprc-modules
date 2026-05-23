

/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  b.lsid,
  b.id,
  --b.date,
  b.wdate as MostRecentWeightDate,
  b.weight as MostRecentWeight,
  convert(BloodLast30, float) as BloodLast30,
  convert(BloodNext30, float) as BloodNext30,
  convert((b.weight*(b.species.max_draw_pct)*(b.species.blood_per_kg)), float) AS MaxBlood,
  TRUNCATE(ROUND(CAST(((b.weight*(b.species.max_draw_pct)*(b.species.blood_per_kg)) - b.BloodLast30) AS NUMERIC),2),2) as AvailBlood
from (
SELECT
  d.lsid,
  d.id,
  d.species,
--   d.weight,
--   d.wdate,
  lastWeight.date as wdate,
  (
    SELECT AVG(w.weight) AS _expr
    FROM study.weight w
    WHERE w.id=d.id AND w.date=lastWeight.date
  ) AS weight,
  COALESCE ((
    SELECT
    SUM(bd.quantity) AS _expr
    FROM study."Blood Draws" bd
    WHERE bd.id=d.id AND
        --bd.date BETWEEN TIMESTAMPADD('SQL_TSI_DAY', -30, now()) AND now()
        (cast(bd.date as date) >= cast(TIMESTAMPADD('SQL_TSI_DAY', -30, now()) as date) AND cast(bd.date as date) <= cast(curdate() as date))

  ), 0) AS BloodLast30,
  COALESCE ((
    SELECT
    SUM(bd.quantity) AS _expr
    FROM study."Blood Draws" bd
    WHERE bd.id=d.id AND
        --bd.date BETWEEN now() AND TIMESTAMPADD('SQL_TSI_DAY', 30, now())
        (cast(bd.date as date) > cast(curdate() as date) AND cast(bd.date as date) <= cast(TIMESTAMPADD('SQL_TSI_DAY', 30, now()) as date))

  ), 0) AS BloodNext30

FROM
    study.demographics d
    LEFT OUTER JOIN
    (SELECT w.id, MAX(date) as date FROM study.weight w
    GROUP BY w.id) lastWeight ON d.id = lastWeight.id

-- WHERE b.date >= TIMESTAMPADD('SQL_TSI_DAY', -30, now())
WHERE

d.calculated_status = 'Alive'

) b