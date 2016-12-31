/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
lower(id) as Id,
FixDate(birth) AS Date,
(sex) as gender,
(status) AS status,
(avail) AS avail,
(hold) AS hold,
(dam) AS dam,
(sire) AS sire,
(origin) AS origin,
FixDate(birth) AS birth,
FixDate(death) AS death,
FixDateTime(arrivedate, arrivetime) AS arrivedate,
FixDateTime(departdate, departtime) AS departdate,
(room) AS room,
(cage) AS cage,
(cond) AS cond,
(weight) AS weight,
FixDateTime(wdate, wtime) AS wdate,
FixDate(tbdate) AS tbdate,
(medical) AS medical,
(purchasedby) AS prepaid,
CASE
  WHEN (v_status = "" OR v_status IS NULL)
    then "Not Defined"
  ELSE
    v_status
END AS v_status,
ts,
uuid AS objectid,
null as parentid
  

FROM abstract
WHERE length(id) > 1
AND ts > ?

/*
UNION ALL

SELECT
lower(p.id) as Id,
FixDate(p.birth) AS Date,
(p.sex) as gender,
(p.status) AS status,
null AS avail,
null AS hold,
(p.dam) AS dam,
(p.sire1) AS sire,
null AS origin,
FixDate(p.birth) AS birth,
null AS death,
null AS arrivedate,
null AS departdate,
null AS room,
null AS cage,
null AS cond,
null as weight,
null AS wdate,
null AS tbdate,
null AS medical,
null AS prepaid,
"Not Defined" AS v_status,
p.ts,
p.uuid AS objectid,
null as parentid

FROM abstract a
RIGHT OUTER JOIN pedigree p ON (a.id=p.id)
where a.id is null
AND length(p.id) > 1
AND p.ts > ?
*/