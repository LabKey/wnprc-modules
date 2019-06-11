/*
 * This is a Business Continuity Report of the current Locations of animals in the Primate Center.
 */

SELECT *

FROM (
  SELECT
  Id as id,
  id.demographics.medical as medical,
  id.demographics.v_status as viralStatus,
  Id.mostRecentWeight.mostRecentWeight as weight,
  id.curLocation.area as area,
  id.curLocation.room as room,
  id.curLocation.cage as cage,
  id.curLocation.cond as condition,
  id.curLocation.remark as remark,
  calculated_status as status

  FROM study.demographics
) as housing

WHERE status = 'Alive'