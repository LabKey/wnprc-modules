SELECT
       rowId,
       Id,
       transactionNumber,
       item,
       (CASE WHEN comment IS NULL THEN 'Unknown Item' ELSE comment END) AS comment,
       chargeId.departmentCode AS groupName,
       quantity,
       unitCostDirect AS unitCost,
       totalCostDirect AS totalCost,
       date,
       invoiceDate,
       category,
       servicecenter,
       invoiceNumber
FROM ehr_billing.invoicedItems