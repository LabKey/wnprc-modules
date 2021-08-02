-- open requests assigned to the current purchase admin user
SELECT
    pr.rowId AS requestNum,
    pr.created   AS requestDate,
    pr.vendorId,
    pr.totalCost,
    pr.account || pr.otherAcctAndInves AS account,
    pr.qcState   AS requestStatus,
    pr.createdBy AS requester,
    pr.assignedTo,
    pr.attachments
FROM ehr_purchasing.purchasingRequests pr
WHERE ISMEMBEROF(pr.assignedTo) AND (pr.qcState.label = 'Review Pending' OR pr.qcState.label = 'Request Approved')