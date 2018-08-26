SELECT *,
  round((CAST(miscWithRates.quantity * miscWithRates.unitCost AS DOUBLE)), 2) AS totalCost
FROM
  (SELECT
  wmisc.Id,
  wmisc.date,
  wmisc.billingDate,
  wmisc.project,
  wmisc.debitedaccount,
  wmisc.chargetype,
  wmisc.chargeId,
  ci.departmentCode AS serviceCenter,
  ci.name AS item,
  (CASE
    WHEN wmisc.unitCost IS NULL OR wmisc.unitCost = 0
      THEN (cr.unitCost + (cr.unitCost * wmisc.tierRate))
    ELSE (wmisc.unitCost + (wmisc.unitCost * wmisc.tierRate)) END) AS unitCost,
  coalesce(wmisc.quantity, 1) AS quantity,
  coalesce(ci.category, 'Misc. Fees') AS category,
  wmisc.chargeCategory, --adjustment or reversal
  wmisc.objectid AS sourceRecord,
  wmisc.comment,
  wmisc.objectid,
  wmisc.created,
  wmisc.createdby,
  wmisc.taskId,
  wmisc.creditedaccount,
  coalesce(acct.investigatorName, wmisc.investigator) AS investigator,

  CASE WHEN (wmisc.chargeCategory = 'Reversal' OR wmisc.chargeCategory LIKE 'Adjustment%') THEN 'Y' ELSE NULL END AS isAdjustment,
  CASE WHEN (wmisc.unitCost IS NULL AND cr.unitCost IS NULL) THEN 'Y' ELSE NULL END AS lacksRate,

  cr.rowid AS rateId,
  (SELECT group_concat(distinct a.project.displayName, chr(10)) AS projects FROM study.assignment a WHERE
    wmisc.Id = a.Id AND
    (cast(wmisc.date AS DATE) <= a.enddate OR a.enddate IS NULL) AND
    cast(wmisc.date AS date) >= a.dateOnly
  ) AS assignmentAtTime,

  wmisc.container,

  CASE
  WHEN (acct.budgetStartDate IS NOT NULL AND CAST(acct.budgetStartDate AS date) > CAST(wmisc.date AS date)) THEN 'Prior To Budget Start'
  WHEN (acct.budgetEndDate IS NOT NULL AND CAST(acct.budgetEndDate AS date) < CAST(wmisc.date AS date)) THEN 'After Budget End'
  ELSE NULL
  END AS isExpiredAccount,

  CASE WHEN (TIMESTAMPDIFF('SQL_TSI_DAY', wmisc.date, curdate()) > 45) THEN 'Y' ELSE null END AS isOldCharge, -- 45 may not always be true depending on the center, adjust accordingly.

  wmisc.currentActiveAlias,
  wmisc.sourceInvoicedItem,

  TRUE AS isMiscCharge

FROM wnprc_billing.miscChargesWithTierRates wmisc

  LEFT JOIN ehr_billing_public.aliases acct ON (
    acct.alias = COALESCE (wmisc.debitedAccount, wmisc.creditedaccount)
    )

  LEFT JOIN ehr_billing_public.chargeableItems ci
  ON wmisc.chargeId = ci.rowid

  LEFT JOIN
  ehr_billing_public.chargeRates cr
  ON
  (CAST(wmisc.date AS DATE) >= CAST(cr.startDate AS DATE) AND
   (CAST(wmisc.date AS DATE) <= cr.enddate OR cr.enddate IS NULL) AND
   wmisc.chargeId = cr.chargeId)) miscWithRates