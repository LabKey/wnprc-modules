/*
 * This is a Business Continuity Report of the current treatments in the Primate Center.
 */

SELECT
Id,

Id.curlocation.area as area,
Id.curlocation.room as room,
Id.curlocation.cage as cage,
Id.mostRecentWeight.mostRecentWeight as weight,

frequency.meaning as frequency,
code.meaning as treatment,
meaning as shortName,
qualifier,
route.meaning as route,
remark

volume,
vol_units as volumeUnits,
concentration,
conc_units as concentrationUnits,
dosage,
dosage_units as dosageUnits,
amount,
amount_units as amountUnits,

date as startdate,
enddate,
project,
project.account as account,
code as treatmentCode,

FROM study.treatment_order treatments

WHERE (
  (date < curdate())
  AND
  (
    (enddate IS NULL)
    OR
    (enddate > curdate())
  )
)