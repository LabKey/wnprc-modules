-- get accounts that are in ehr_billing.aliases for active or null tierRates
SELECT * FROM
  (
    SELECT
      wmisc.Id,
      wmisc.date,
      wmisc.billingDate,
      wmisc.project,
      wmisc.debitedAccount,
      wmisc.chargetype, --adjustment or reversal
      wmisc.chargeId,
      wmisc.chargeGroup,
      wmisc.objectid AS sourceRecord,
      wmisc.comment,
      wmisc.objectid,
      wmisc.created,
      wmisc.createdby,
      wmisc.taskId,
      wmisc.creditedaccount,
      wmisc.container,
      wmisc.currentActiveAlias,
      wmisc.investigator,
      wmisc.sourceInvoicedItem,
      wmisc.isMiscCharge,
      wmisc.unitCost,
      wmisc.quantity,
      COALESCE(a.tier_rate.tierRate, 0) AS tierRate,
      a.tier_rate.isActive AS isTierRateActive
    FROM wnprc_billing.miscChargesData wmisc
      INNER JOIN ehr_billing_public.aliases a ON a.alias = wmisc.debitedaccount
  ) accountsInAliases WHERE accountsInAliases.isTierRateActive IS NULL OR accountsInAliases.isTierRateActive = true

UNION ALL --union is necessary/cleaner since not all the accounts are in ehr_billing.aliases to be able to get the tierRates

-- accounts that are in not ehr_billing.aliases
SELECT
  wmisc.Id,
  wmisc.date,
  wmisc.billingDate,
  wmisc.project,
  wmisc.debitedaccount,
  wmisc.chargetype, --adjustment or reversal
  wmisc.chargeId,
  wmisc.chargeGroup,
  wmisc.objectid AS sourceRecord,
  wmisc.comment,
  wmisc.objectid,
  wmisc.created,
  wmisc.createdby,
  wmisc.taskId,
  wmisc.creditedaccount,
  wmisc.container,
  wmisc.currentActiveAlias,
  wmisc.investigator,
  wmisc.sourceInvoicedItem,
  wmisc.isMiscCharge,
  wmisc.unitCost,
  wmisc.quantity,
  0 AS tierRate,
  true AS isTierRateActive
FROM wnprc_billing.miscChargesData wmisc
  LEFT JOIN ehr_billing_public.aliases a ON a.alias = wmisc.debitedaccount
WHERE a.alias IS NULL