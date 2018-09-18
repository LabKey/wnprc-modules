/*
 * This query represents all outstanding requests that need to be approved
 */

SELECT
requestid as lsid,
requestid.rowid as requestid,
Id as animalid, 
"date",
created,
caseno,
project,
account,
location,
performedby as pathologist,
requestid.qcstate as state,
comments as comments,
createdby.displayname as requestor,
requestid.priority as priority


FROM study.necropsies
WHERE requestid IS NOT NULL