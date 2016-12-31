/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/*SET @@group_concat_max_len = 4000;*/

SELECT
  id,
  type,
  date,
  enddate,
  project,
  account,
  title,
  performedby,
  major,
  caseno,
  left(group_concat(old_remark), 3999) AS remark,
  max(ts) as ts,
  objectid
FROM (SELECT
  lower(id) as Id,
  'Surgery' as type,
  FixDateTime(date, time) AS Date,
  FixDateTime(enddate, endtime) AS enddate,
  pno as project,
  null as account,
  null as title,
  surgeon as performedby,
  major,
  null as caseno,
  /*inves,*/

  FixNewlines(remark) AS old_remark,
  CASE
    WHEN remark LIKE "(%" THEN remark
    ELSE " ("
  END AS sort_order,
  remark regexp '^\\(cont(inued)*(-*)([0-9]*)' as cont,
  remark regexp '^\\(cont(inued)*(-*)([0-9][0-9])' as cont10,
  ts,
  uuid AS objectid
  FROM surghead s
  WHERE length(s.id) > 1
  ORDER BY cont,cont10,sort_order
) s
GROUP BY s.id, s.date, s.enddate, s.project, s.performedby
HAVING max(ts) > ?

UNION ALL

SELECT
  id,
  type,
  date,
  enddate,
  project,
  account,
  title,
  performedby,
  major,
  caseno,
  left(group_concat(old_remark), 3999) AS remark,
  max(ts) as ts,
  objectid
FROM (SELECT
  lower(id) as Id,
  'Necropsy' as type,
  cast(FixDate(date) as datetime) AS Date,
  null as enddate,
  null as project,
  account,
  caseno as title,
  null as performedby,
  null as major,
  n.caseno,
  FixNewlines(remark) AS old_remark,
  CASE
    WHEN remark LIKE "(%" THEN remark
    ELSE " ("
  END AS sort_order,
  remark regexp '^\\(cont(inued)*(-*)([0-9]*)' as cont,
  remark regexp '^\\(cont(inued)*(-*)([0-9][0-9])' as cont10,
  ts,
  uuid AS objectid
  FROM necropsyhead n
  WHERE length(id) > 1
  ORDER BY cont,cont10,sort_order
) n
GROUP BY n.id, n.date, n.caseno, n.account
HAVING max(ts) > ?


UNION ALL

SELECT
  id,
  type,
  date,
  enddate,
  project,
  account,
  title,
  performedby,
  major,
  caseno,
  left(group_concat(old_remark), 3999) AS remark,
  max(ts) as ts,
  objectid
FROM (SELECT
  lower(id) as Id,
  'Biopsy' as type,
  cast(FixDate(date) as datetime) AS Date,
  null as enddate,
  null as project,
  account,
  caseno as title,
  null as performedby,
  null as major,
  b.caseno,
  ts,
  FixNewlines(remark) as old_remark,
  CASE
    WHEN remark LIKE "(%" THEN remark
    ELSE " ("
  END AS sort_order,
  remark regexp '^\\(cont(inued)*(-*)([0-9]*)' as cont,
  remark regexp '^\\(cont(inued)*(-*)([0-9][0-9])' as cont10,
  uuid AS objectid
FROM biopsyhead b
WHERE length(id) > 1
ORDER BY cont,cont10,sort_order
) b
GROUP BY b.id, b.date, b.caseno, b.account
HAVING max(ts) > ?


