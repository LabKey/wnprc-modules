/*
 * This query represents all outstanding requests that need to be approved
 */

SELECT
  lsid,
  requestid,
  requestid.rowid as rowid,
  objectid,
  procedure,
  taskid,
  Id as animalid,
  date,
  enddate,
  created,
--   caseno,
  project,
  account,
  location,
--   performedby as pathologist,
  requestid.qcstate as state,
--   comments as comments,
  createdby.displayname as requestor,
  requestid.priority as priority,
  comments

FROM study.surgery_procedure
WHERE requestid IS NOT NULL