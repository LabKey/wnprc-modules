-- get accounts that are in ehr_billing.aliases for active or null tierRates
SELECT * FROM
  (
    SELECT
      pf.Id,
      pf.date,
      pf.project,
      pf.account,
      pf.sourceRecord,
      pf.taskid,
      pf.tubes,
      COALESCE(a.tier_rate.tierRate, 0) AS tierRate,
      a.tier_rate.isActive AS isTierRateActive,
      pf.performedby
    FROM wnprc_billing.procedureFees pf
      INNER JOIN ehr_billing.aliases a ON a.alias = pf.account
  ) accountsInAliases WHERE accountsInAliases.isTierRateActive IS NULL OR accountsInAliases.isTierRateActive = true

UNION ALL --union is necessary/cleaner since not all the accounts are in ehr_billing.aliases to be able to get the tierRates

-- accounts that are in not ehr_billing.aliases
SELECT
  pf.Id,
  pf.date,
  pf.project,
  pf.account,
  pf.sourceRecord,
  pf.taskid,
  pf.tubes,
  0 AS tierRate,
  true AS isTierRateActive,
  pf.performedby
FROM wnprc_billing.procedureFees pf
  LEFT JOIN ehr_billing.aliases a ON a.alias = pf.account 
  WHERE a.alias IS NULL