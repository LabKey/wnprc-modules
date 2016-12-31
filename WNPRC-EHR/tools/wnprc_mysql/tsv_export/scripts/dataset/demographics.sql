/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(birth) AS Date, (sex) as gender, (status) AS status, (avail) AS avail,
(hold) AS hold, (dam) AS dam, (sire) AS sire, (origin) AS origin,
FixDate(birth) AS birth, FixDate(death) AS death,
FixDateTime(arrivedate, arrivetime) AS arrivedate,
FixDateTime(departdate, departtime) AS departdate,
(room) AS room, (cage) AS cage, (cond) AS cond, 
(weight) AS weight, FixDateTime(wdate, wtime) AS wdate, FixDate(tbdate) AS tbdate,
(medical) AS medical, (purchasedby) AS purchasedby,
CASE
  WHEN (v_status = "" OR v_status IS NULL)
    then "Not Defined"
  ELSE
    v_status
END AS v_status, ts, uuid AS objectid, null as parentid
  

FROM abstract


