-- this query will be used to get the columns for the template
SELECT
  ci.name,
  ci.category,
  ci.serviceCode,
  ci.departmentCode,
  ci.startDate,
  ci.endDate,
  cr.unitCost,
  cr.genCredits
  FROM ehr_billing.chargeableItems ci
  FULL OUTER JOIN ehr_billing.chargeRates cr
    ON ci.rowid = cr.chargeId