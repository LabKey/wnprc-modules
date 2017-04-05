/*
 * This query feeds the Necropsy Schedule JSP page/calendar.
 */

SELECT
taskid as lsid,
taskid.rowid as taskid,
Id as animalid,
"date",
location,
taskid.qcstate as state

FROM study.necropsy
WHERE taskid IS NOT NULL