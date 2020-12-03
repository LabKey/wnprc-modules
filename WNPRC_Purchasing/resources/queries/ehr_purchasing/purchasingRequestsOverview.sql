SELECT pr.account,
       pr.qcStatus         AS requestStatus,
       pr.created          AS requestDate,
       pr.createdBy        AS requestor,
       sum(items.unitCost) AS totalCost
FROM ehr_purchasing.purchasingRequests pr
LEFT JOIN ehr_purchasing.lineItems items ON pr.requestId = items.requestId
GROUP BY pr.account,
         pr.qcStatus,
         pr.created,
         pr.createdBy