/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  e.employeeid,
  sop.id as SOP_ID,
  sop.name,
  sop.LinkedPDF.PDF AS PDF,
  sop.Spanish_PDF,
  e.email,
  T1.LastRead,

  --we calculate the time until renewal
  --this subquery was written before I changed this to use joins
  --it is no longer needed, but i kept it b/c is uses age_in_months and is working
  CONVERT(
  CASE
    WHEN (T1.LastRead IS NULL) THEN
      0
    ELSE
      COALESCE(
        --(12 - age_in_months(T1.MostRecentDate, curdate())) , 0)

      (SELECT (24 - age_in_months(sq1.MostRecentDate, curdate())) AS TimeUntilRenewal
      FROM
        (SELECT max(t.date) AS MostRecentDate, t.SOPID, t.EmployeeId FROM ehr_compliancedb.SOPdates t GROUP BY t.EmployeeId, t.SOPID) sq1
        WHERE sq1.SOPID = sc.SOP_ID AND e.employeeid = sq1.EmployeeId), 0)
    END, double)
    AS MonthsUntilRenewal,

    CASE
      WHEN sc.sop_id IS NULL then FALSE
      ELSE TRUE
    END as required

FROM ehr_compliancedb.Employees e

CROSS JOIN PublicSOPs.SOPs sop
  --ON (e.category = sc.category)

LEFT JOIN ehr_compliancedb.SOPbyCategory sc
  ON (e.category = sc.category AND sop.id = sc.sop_id)

LEFT JOIN
  (SELECT max(t.date) AS LastRead, t.SOPID, t.EmployeeId FROM ehr_compliancedb.SOPdates t GROUP BY t.EmployeeId, t.SOPID) T1
  ON (T1.SOPID = sc.SOP_ID AND T1.EmployeeId = e.employeeid)

WHERE e.EndDateCoalesced >= curdate()