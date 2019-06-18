SELECT HDR.Header_ID,HDR.Date_and_Time AS date,
PT.Patient_ID, Laboratory_Assigned_Patient_ID AS Id, Patient_Name_Name_First_name, Birthdate, Patient_Sex, Special_Field_1,
ORD.Orden_ID, ORD.Requested_Ordered_Date_and_Time,ORD.Sample_ID,
CMO.OrderComment as OrderComment,
RST.Universal_Test_ID AS testid, RST.oor AS resultOORIndicator ,RST.result_value AS result, RST.Unit AS units

FROM CHEMISTRYANALYZER.patient_view PT

JOIN CHEMISTRYANALYZER.order_view ORD
ON PT.Patient_ID = ORD.Patient_ID


JOIN  CHEMISTRYANALYZER.result_view RST
ON ORD.Orden_ID = RST.Orden_ID

JOIN  CHEMISTRYANALYZER.header_view HDR
ON HDR.Header_ID = PT.Header_ID

LEFT JOIN CHEMISTRYANALYZER.MergingComentOrders CMO
ON  ORD.Orden_ID = CMO.Orden_ID

WHERE startswith(Patient_Name_Name_First_name,'MONKEY')
