/*
 * This query feeds the Necropsy Schedule JSP page/calendar.
 */

SELECT
taskid as lsid,
taskid.rowid as taskid,
Id as animalid,
"date",
location,
taskid.qcstate as state,
nsuite.display_color

FROM study.necropsy

LEFT JOIN wnprc.necropsy_suite nsuite
ON nsuite.room = necropsy.location

WHERE taskid IS NOT NULL
