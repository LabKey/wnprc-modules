/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
e.employeeId,
sc.sop_id,
sop.name,
sop.pdf,
sop.Spanish_PDF,
sop.video,
T1.LastRead,

sop.activeDate,
CONVERT(
  CASE
  	WHEN (T1.LastRead is NULL) Then
		0
	ELSE
	  COALESCE( (SELECT (12-age_in_months(sq1.MostRecentDate, curdate())) as TimeUntilRenewal
           FROM
	     (SELECT max(t.date) as MostRecentDate, t.sopid, t.employeeid from ehr_compliancedb.sopdates t group by t.employeeid, t.sopid) sq1
	  	where sq1.sopid = sc.sop_id and e.employeeid = sq1.employeeid), 0)
	END, double) AS
MonthsUntilRenewal,

  CASE
	WHEN sc.sop_id is null then false
	else true
	end as
required

from ehr_compliancedb.employees e

cross join PublicSOPs.SOPs sop

LEFT JOIN ehr_compliancedb.SOPbyCategory sc   ON (e.category = sc.category and sop.id = sc.sop_id)

LEFT JOIN (SELECT max(t.date) as lastRead, t.sopid, t.employeeid from ehr_compliancedb.sopdates t group by t.employeeid, t.sopid) t1 on (e.employeeid = t1.employeeid and sc.sop_id = t1.sopid)

where e.employeeid is not null