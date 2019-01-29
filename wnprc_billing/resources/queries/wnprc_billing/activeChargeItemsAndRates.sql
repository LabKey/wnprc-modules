--PARAMETERS(Date TIMESTAMP)

SELECT
  ci.rowid,
  ci.name,
  ci.chargeCategoryId,
  ci.departmentCode,
  cr.unitCost
FROM
  ehr_billing.chargeRates cr
LEFT JOIN ehr_billing.chargeableItems ci on (ci.rowid = cr.chargeId)
--WHERE
  --  cr.endDate < Date