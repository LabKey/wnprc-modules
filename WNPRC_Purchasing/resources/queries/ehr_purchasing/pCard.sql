SELECT
       pr.vendorId,
       items.description,
       pr.justification,
       pr.orderDate,
       pr.cardPostDate,
       items.totalCost, -- this needs to be changed to totalCharge - will it be different than totalCost? should there be a new field?
       pr.account,

       pr.program,
       pr.createdBy,
       pr.comments,
--        pr.orderNum, --new field?
       pr.invoiceNum
--        pr.confirmationNum, -- not used here?
--     pr.pkslip -- new field? attachment related
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
WHERE ISMEMBEROF(pr.createdBy)