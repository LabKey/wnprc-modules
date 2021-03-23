SELECT
       pr.rowId AS requestNum,
       pr.vendorId,
       pr.account,
       pr.otherAcctAndInves,
       pr.qcState   AS requestStatus,
       pr.created   AS requestDate,
       pr.createdBy AS requester,
       pr.totalCost,
       pr.assignedTo
FROM ehr_purchasing.purchasingRequests pr