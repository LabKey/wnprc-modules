/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) AS Date, (pno) AS project, (t.code) AS code, t.meaning AS meaning, (volume) AS volume, (vunits) AS vol_units, (conc) AS concentration, (cunits) AS cunits, (amount) AS amount, (units) AS amount_units, (route) AS route, FixDate(enddate) AS enddate, (frequency) AS frequency, FixNewlines(remark) AS remark, (userid) AS userid,
s1.meaning as snomedMeaning,
t.ts, t.uuid AS objectid

FROM treatments t

LEFT OUTER JOIN snomed s1 ON s1.code=t.code



