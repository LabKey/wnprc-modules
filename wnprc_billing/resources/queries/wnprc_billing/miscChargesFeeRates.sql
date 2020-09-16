SELECT *,
   round((CAST(miscWithRates.quantity * miscWithRates.unitCostDirect AS DOUBLE)), 2) AS totalCostDirect, -- total cost without tier rate
   round((CAST(miscWithRates.quantity * miscWithRates.unitCost AS DOUBLE)), 2)       AS totalCost -- total cost with tier rate
FROM
  (SELECT
  wmisc.Id,
  wmisc.date,
  wmisc.billingDate,
  wmisc.project,
  wmisc.debitedAccount,
  wmisc.chargetype, --adjustment or reversal
  wmisc.chargeId,
  wmisc.chargeGroup AS groupName,
  ci.name AS item,
  (CASE
     WHEN wmisc.unitCost IS NULL OR wmisc.unitCost = 0
             THEN cr.unitCost
     ELSE wmisc.unitCost
      END)  AS unitCostDirect, -- unit cost without tier rate
  (CASE
    WHEN wmisc.unitCost IS NULL OR wmisc.unitCost = 0
      THEN (cr.unitCost + (cr.unitCost * wmisc.tierRate))
    ELSE (wmisc.unitCost + (wmisc.unitCost * wmisc.tierRate)) END) AS unitCost, -- unit cost with tier rate
  coalesce(wmisc.quantity, 1) AS quantity,
  coalesce(cic.name, 'Misc. Fees') AS category,
  wmisc.objectid AS sourceRecord,
  wmisc.comment,
  wmisc.objectid,
  wmisc.created,
  wmisc.createdby,
  wmisc.taskId,
  wmisc.creditedaccount,

     cr.rowid                                            AS rateId,
     (SELECT group_concat(DISTINCT a.project.displayName, chr(10)) AS projects
      FROM study.assignment a
      WHERE
        wmisc.Id = a.Id AND
        (cast(wmisc.date AS DATE) <= a.enddate OR a.enddate IS NULL) AND
        cast(wmisc.date AS DATE) >= a.dateOnly
     )                                                   AS assignmentAtTime,

     wmisc.container,
     wmisc.currentActiveAlias,
     wmisc.sourceInvoicedItem,

     TRUE                                                AS isMiscCharge,

  --fields used in email notification
  (CASE WHEN wmisc.debitedaccount IS NULL THEN 'Y' ELSE NULL END) AS isMissingAccount,
  (CASE
     WHEN (wmisc.debitedaccount.budgetStartDate IS NOT NULL AND CAST(wmisc.debitedaccount.budgetStartDate AS date) > CAST(wmisc.date AS date))
             THEN 'Prior To Budget Start'
     WHEN (wmisc.debitedaccount.budgetEndDate IS NOT NULL AND CAST(wmisc.debitedaccount.budgetEndDate AS date) < CAST(wmisc.date AS date))
             THEN 'After Budget End'
     ELSE NULL END) AS isExpiredAccount,
  (CASE WHEN wmisc.debitedaccount.isAcceptingCharges IS FALSE THEN 'N' END) AS isAcceptingCharges,
  (CASE
     WHEN ((wmisc.unitCost IS NULL OR wmisc.unitCost = 0) AND (cr.unitCost IS NULL OR cr.unitCost = 0)) THEN 'Y'
     ELSE NULL END) AS lacksRate,
  (CASE WHEN wmisc.investigator IS NOT NULL THEN wmisc.investigator
      WHEN wmisc.debitedAccount.investigatorId IS NOT NULL THEN wmisc.debitedAccount.investigatorId.investigatorWithName
      WHEN wmisc.project.investigatorId IS NOT NULL THEN wmisc.project.investigatorId.investigatorWithName
      ELSE NULL END) AS investigator,
  (CASE
    WHEN (SELECT count(*) as projects
          FROM study.assignment a
          WHERE wmisc.Id = a.Id
            AND (wmisc.project = a.project OR wmisc.project.protocol = a.project.protocol)
            AND (cast(wmisc.date AS DATE) <= a.enddateCoalesced OR a.enddate IS NULL)
            AND cast(wmisc.date AS date) >= a.dateOnly) > 0 THEN NULL ELSE 'N'
    END) AS matchesProject,
  CASE WHEN (wmisc.chargetype = 'Reversal' OR wmisc.chargetype = 'Adjustment') THEN 'Y' ELSE NULL END AS isAdjustment,
  CASE WHEN (TIMESTAMPDIFF('SQL_TSI_DAY', wmisc.date, curdate()) > 45) THEN 'Y' ELSE null END AS isOldCharge,
  wmisc.debitedAccount.projectNumber

   FROM wnprc_billing.miscChargesWithTierRates wmisc

     LEFT JOIN ehr_billing_public.aliases acct ON (
       acct.alias = COALESCE(wmisc.debitedAccount, wmisc.creditedaccount)
       )

     LEFT JOIN ehr_billing_public.chargeableItems ci
       ON wmisc.chargeId = ci.rowid

     LEFT JOIN ehr_billing_public.chargeableItemCategories cic
            ON ci.chargeCategoryId = cic.rowid

     LEFT JOIN
     ehr_billing_public.chargeRates cr
       ON
         (CAST(wmisc.date AS DATE) >= CAST(cr.startDate AS DATE) AND
          (CAST(wmisc.date AS DATE) <= cr.enddate OR cr.enddate IS NULL) AND
          wmisc.chargeId = cr.chargeId)) miscWithRates