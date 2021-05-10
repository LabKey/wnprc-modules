SELECT
       pr.rowId AS requestNum,
       pr.vendorId.vendorName AS vendor,
       pr.qcState.Label   AS requestStatus,
       pr.created   AS requestDate,
       pr.createdBy AS requester,
       pr.orderDate,
       pr.totalCost
FROM ehr_purchasing.purchasingRequests pr