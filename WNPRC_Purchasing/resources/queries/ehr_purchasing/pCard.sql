SELECT
       pr.vendorId,
       items.description,
       pr.justification,
       pr.orderDate,
       pr.cardPostDate,
       pr.totalCost,
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
               group_concat(item, ', ') AS description
        FROM ehr_purchasing.lineItems
        GROUP BY requestRowId
    ) items
ON pr.rowId = items.requestRowId