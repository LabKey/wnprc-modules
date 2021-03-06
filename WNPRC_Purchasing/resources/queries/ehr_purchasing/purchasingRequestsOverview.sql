-- this is the query that displays on the requesters page
SELECT
       pr.rowId,
       pr.vendorId AS vendor,
       pr.account,
       pr.otherAcctAndInves,
       pr.qcState   AS requestStatus,
       pr.created   AS requestDate,
       pr.orderDate,
       pr.createdBy AS requester,
       pr.totalCost
FROM ehr_purchasing.purchasingRequests pr
WHERE ISMEMBEROF(pr.createdBy) -- only sees requests created by the current user/requester