SELECT pr.rowId,
       pr.account,
       pr.otherAcctAndInves,
       pr.qcState        AS requestStatus,
       pr.created          AS requestDate,
       pr.createdBy        AS requestor,
       round(sum(items.quantity * items.unitCost), 2) AS totalCost
FROM ehr_purchasing.purchasingRequests pr
LEFT JOIN ehr_purchasing.lineItems items ON pr.requestId = items.requestId
GROUP BY pr.rowId,
         pr.account,
         pr.otherAcctAndInves,
         pr.qcstate,
         pr.created,
         pr.createdBy