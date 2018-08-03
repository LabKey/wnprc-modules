/*
 * This query represents all outstanding requests that need to be approved
 */

SELECT
  lsid,
  requestid,
  requestid.rowid as rowid,
  objectid,
  proceduretype,
  procedurename,
  taskid,
  Id as animalid,
  date,
  enddate,
  created,
  project,
  account,
  location,
  requestid.qcstate as state,
  createdby.displayname as requestor,
  requestid.priority as priority,
  linktoexisting,
  linkedrequest,
  comments,
  statuschangereason

FROM study.surgery_procedure
WHERE requestid IS NOT NULL