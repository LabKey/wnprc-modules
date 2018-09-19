-- this query will be used to get the columns for the template
SELECT
--   "test" AS oldPk,
  ci.name,
  ci.category,
  ci.serviceCode,
  ci.departmentCode,
  ci.startDate AS chargeableItemStartDate,
  ci.endDate AS chargeableItemEndDate,
  ci.comment,
  ci.active,
  ci.allowBlankId,
  cr.unitCost,
  cr.genCredits,
  cr.startDate AS chargeRateStartDate,
  cr.endDate AS chargeRateEndDate
  FROM ehr_billing.chargeableItems ci
  FULL OUTER JOIN ehr_billing.chargeRates cr
    ON ci.rowid = cr.chargeId