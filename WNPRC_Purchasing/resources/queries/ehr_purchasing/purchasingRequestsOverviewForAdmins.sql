SELECT
       pr.rowId,
       pr.vendorId,
       pr.account,
       pr.otherAcctAndInves,
       pr.qcState   AS requestStatus,
       pr.created   AS requestDate,
       pr.createdBy AS requester,
       items.totalCost,
       pr.assignedTo
FROM ehr_purchasing.purchasingRequests pr
LEFT JOIN
    (
        SELECT requestRowId,
               round(sum(quantity * unitCost), 2) AS totalCost
        FROM ehr_purchasing.lineItems
        GROUP BY requestRowId
    ) items
ON pr.rowId = items.requestRowId