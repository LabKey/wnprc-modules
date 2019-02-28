SELECT 
  mcfr.Id,
  mcfr.date,
  mcfr.project,
  mcfr.quantity,
  mcfr.unitCost,
  mcfr.totalcost,
  mcfr.item,
  mcfr.chargeId,
  mcfr.chargeId.serviceCode,
  mcfr.chargeId.departmentCode AS groupName,
  mcfr.category,
  mcfr.comment AS itemDescription,
  mcfr.debitedAccount,
  mcfr.investigator AS principalInvestigator,
  mcfr.debitedAccount.contact_name AS contactName,
  mcfr.debitedAccount.po_amount AS poAmount,
  mcfr.created,
  mcfr.createdby,
  mc.invoiceId,
  mc.taskId
FROM wnprc_billing.miscChargesFeeRates mcfr JOIN ehr_billing.miscCharges mc on mcfr.taskId = mc.taskId and mcfr.sourceRecord = mc.objectID
WHERE mc.invoiceId IS NULL