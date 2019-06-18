SELECT MCO.Id, MCO.Patient_ID, MCO.Orden_ID, MCO.OrderComment

--MCO.Patient_ID,  MCO.Id,  MCO.Orden_ID,
--CMO.text, CMO.Orden_ID AS OrderId

FROM CHEMISTRYANALYZER.MergingComentOrders MCO

JOIN CHEMISTRYANALYZER.MergingComentOrders MCO2
ON MCO.Sample_ID = MCO2.Sample_ID

--CHEMISTRYANALYZER.Comment_Orden CMO

--WHERE CMO.Orden_ID IN (
--SELECT ORDEN_ID FROM CHEMISTRYANALYZER.MergingComentOrders MCO
--)
--LEFT JOIN CHEMISTRYANALYZER.MergingComentOrders MCO
--ON MCO.Orden_ID = CMO.Orden_ID