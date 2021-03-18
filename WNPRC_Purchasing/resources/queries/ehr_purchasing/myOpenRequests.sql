-- open requests assigned to the current purchase admin user
SELECT
    pr.rowId AS requestNum,
    pr.created   AS requestDate,
    pr.vendorId,
    items.totalCost,
    pr.account || pr.otherAcctAndInves AS account,
    pr.qcState   AS requestStatus,
    pr.createdBy AS requester,
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
WHERE ISMEMBEROF(pr.assignedTo)