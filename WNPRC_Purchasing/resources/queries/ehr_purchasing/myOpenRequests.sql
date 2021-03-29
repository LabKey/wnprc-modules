-- open requests assigned to the current purchase admin user
SELECT
    pr.rowId AS requestNum,
    pr.created   AS requestDate,
    pr.vendorId,
    pr.totalCost,
    pr.account || pr.otherAcctAndInves AS account,
    pr.qcState   AS requestStatus,
    pr.createdBy AS requester,
    pr.assignedTo
FROM ehr_purchasing.purchasingRequests pr
WHERE ISMEMBEROF(pr.assignedTo)