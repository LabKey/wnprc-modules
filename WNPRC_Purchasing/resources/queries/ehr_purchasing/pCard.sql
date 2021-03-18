SELECT
       pr.vendorId,
       items.description,
       pr.justification,
       pr.orderDate,
       pr.cardPostDate,
       items.totalCost,
       pr.account,

       pr.program,
       pr.createdBy,
       pr.comments,
       pr.rowId AS orderNum,
       pr.invoiceNum,
       pr.paymentOptionId

FROM ehr_purchasing.purchasingRequests pr
LEFT JOIN
    (
        SELECT requestRowId,
               group_concat(item, ', ') AS description,
               round(sum(quantity * unitCost), 2) AS totalCost
        FROM ehr_purchasing.lineItems
        GROUP BY requestRowId
    ) items
ON pr.rowId = items.requestRowId