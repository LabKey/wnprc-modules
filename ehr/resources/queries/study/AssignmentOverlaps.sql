/*
 * Copyright (c) 2011-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP, Protocol CHAR, Project CHAR DEFAULT null)

SELECT
h.lsid,
h.id,
h.date,
h.enddate,
-- h.enddateCoalesce,
-- h.StartDateParam,
-- h.EndDateParam,
h.project,
h.protocol,
h.avail,
h.title,
h.qcstate,

CASE
  WHEN h.StartDateParam > h.date
   THEN TIMESTAMPDIFF('SQL_TSI_DAY', cast(h.StartDateParam as TIMESTAMP), cast(h.enddateCoalesce as TIMESTAMP))
   ELSE TIMESTAMPDIFF('SQL_TSI_DAY', cast(h.date as TIMESTAMP), cast(h.enddateCoalesce as TIMESTAMP))
END as TotalDays

FROM (
  SELECT
  h.lsid,
  h.id,
  cast(h.date as date) as date,
  cast(h.enddate as date) as enddate,
  cast(coalesce(h.enddate, now()) as date) as enddateCoalesce,
  h.project,
  h.project.protocol as protocol,
  h.project.avail as avail,
  h.project.title as title,
  h.qcstate,
  cast(COALESCE(StartDate, '1900-01-01') as date) as StartDateParam,
  cast(COALESCE(EndDate, curdate()) as date) as EndDateParam,
  FROM study.assignment h
) h

WHERE

(h.project.displayName = PROJECT OR PROJECT is null) AND

(h.project.protocol.displayName = PROTOCOL OR PROTOCOL IS NULL OR PROTOCOL = '') AND

(
(h.StartDateParam >= h.date AND h.StartDateParam <= h.enddateCoalesce)
OR
(h.EndDateParam >= h.date AND h.EndDateParam <= h.enddateCoalesce)
OR
(h.StartDateParam <= h.date AND h.EndDateParam >= h.enddateCoalesce)
)