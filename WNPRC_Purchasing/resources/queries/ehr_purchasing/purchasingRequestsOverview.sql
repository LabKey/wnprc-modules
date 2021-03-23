-- for requesters
SELECT
       pr.rowId,
       pr.vendorId,
       pr.account,
       pr.otherAcctAndInves,
       pr.qcState   AS requestStatus,
       pr.created   AS requestDate,
       pr.createdBy AS requester,
       pr.totalCost
FROM ehr_purchasingLinked.purchasingRequests pr
WHERE ISMEMBEROF(pr.createdBy)