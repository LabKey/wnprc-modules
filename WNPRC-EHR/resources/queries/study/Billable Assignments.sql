/*
 * This query displays billable assignments.  Current assignments will have a null enddate, but this
 * changes that to display as today's date.
 */

SELECT Id, project, project.research as isResearch, project.account as account, date as startdate, COALESCE (enddate, curdate()) as enddate FROM study.assignment
WHERE
(
  project.research IS TRUE
  AND
  /*
   * There are some old accounts (1991 - 1993) that don't have accounts associated.  We can disregard these.
   */
  project.account IS NOT NULL
)
