SELECT
requestRowId,
requestRowId.vendorId.vendorName,
item,
requestRowId.orderDate,
requestRowId.confirmationNum,
requestRowId.invoiceNum,
quantity,
quantityReceived,
itemUnitId.itemUnit,
controlledSubstance,
createdBy AS requester,
created AS requestDate
FROM ehr_purchasing.lineItems
WHERE requestRowId.qcState.Label = 'Order Placed'
