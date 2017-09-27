/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time

PARAMETERS(STARTDATE TIMESTAMP, ENDDATE TIMESTAMP)

SELECT
    i.date,
    h.id,
    h.room,
    h.hold,
    h.project,
    h.project.protocol as protocol,
    h.project.account as account,
    CASE
      --zoo animals
      WHEN (h.room like 'zoo%') THEN 'zoo'
      --ageing animals
      WHEN (h.hold LIKE '%ni%' OR h.hold LIKE '%ag%') THEN 'ageing'
      --marms
      WHEN h.id LIKE 'cj%' THEN 'marmoset'
      --wimr animals
	  WHEN h.project IN ('20090801', '20090902', '20090410', '20090409', '20090408', '20090407', '20090411', '20090412', '20090602', '20101002', '20101201') THEN 'wimr'
	  --commercial animals
      WHEN h.project IN('20090501', '20090701', '20090703') THEN 'commercial'
      ELSE 'normal'
    END as type,
    count(*) as totalAssignments,
    1.0 / count(*) as effectiveDays,
    group_concat(h2.project) as assignments,
    group_concat(h2.project.protocol) as protcols
FROM (
  SELECT
    timestampadd('SQL_TSI_DAY', i.value, CAST(COALESCE(STARTDATE, curdate()) AS TIMESTAMP)) as date
  FROM ldk.integers i
  WHERE i.value <= TIMESTAMPDIFF('SQL_TSI_DAY', CAST(COALESCE(ENDDATE, curdate()) AS TIMESTAMP), CAST(COALESCE(STARTDATE, curdate()) AS TIMESTAMP))
  ) i

LEFT JOIN (
  SELECT
    h.id,
    h.id.curlocation.room as room,
    h.id.dataset.demographics.hold as hold,
    h.project,
    h.project.account,
    h.date,
    h.ENDDATE
  FROM study.assignment h

  WHERE
    (cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) >= cast(h.date as date) AND cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) <= COALESCE(cast(h.enddate as date), curdate()))
  OR
    (COALESCE(ENDDATE, curdate()) >= cast(h.date as date) AND COALESCE(ENDDATE, curdate()) <= COALESCE(cast(h.enddate as date), curdate()))
  OR
    (cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) <= cast(h.date as date) AND COALESCE(ENDDATE, curdate()) >= COALESCE(cast(h.enddate as date), curdate()))
) h ON (i.date >= cast(h.date as date) AND i.date <= COALESCE(cast(h.enddate as date), curdate()))

LEFT JOIN (
  SELECT
    h.date,
    h.enddate,
    h.id,
    h.project,
    h.project.account
  FROM study.assignment h

  WHERE (
    (cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) >= h.date AND cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) < COALESCE(h.enddate, curdate()))
  OR
    (COALESCE(ENDDATE, curdate()) > h.date AND COALESCE(ENDDATE, curdate()) <= COALESCE(h.enddate, curdate()))
  OR
    (cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) <= h.date AND COALESCE(ENDDATE, curdate()) >= COALESCE(h.enddate, curdate()))
  ) AND h.project.protocol != 'wprc00'
) h2 ON (h.id = h2.id AND h.date >= h2.date AND h.date < COALESCE(h2.enddate, curdate()))

-- WHERE
-- h2.qcstate.publicdata = true
-- AND h3.qcstate.publicdata = true

GROUP BY i.date, h.id, h.project, h.project.account, h.project.protocol, h.room, h.hold