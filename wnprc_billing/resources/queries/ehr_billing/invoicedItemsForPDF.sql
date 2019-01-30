SELECT
       rowId,
       Id,
       transactionNumber,
       item,
       (CASE WHEN comment IS NULL THEN 'Unknown Item' ELSE comment END) AS comment,
       chargeId.departmentCode AS groupName,
       quantity,
       unitCost,
       totalCost,
       date,
       invoiceDate,
       category,
       servicecenter,
       invoiceNumber
FROM ehr_billing.invoicedItems