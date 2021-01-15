SELECT
       pr.requestId,
       pr.rowId,
       pr.vendorId,
       pr.account,
       pr.otherAcctAndInves,
       pr.qcState   AS requestStatus,
       pr.created   AS requestDate,
       pr.createdBy AS requestor,
       items.totalCost
FROM ehr_purchasing.purchasingRequests pr
LEFT JOIN
    (
        SELECT requestId,
               round(sum(quantity * unitCost), 2) AS totalCost
        FROM ehr_purchasing.lineItems
        GROUP BY requestId
    ) items
ON pr.requestId = items.requestId