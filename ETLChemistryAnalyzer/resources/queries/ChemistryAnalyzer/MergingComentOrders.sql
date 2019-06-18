(SELECT
Laboratory_Assigned_Patient_ID AS Id, PT.Patient_ID,
ORD.Orden_ID as Orden_ID, ORD.Sample_ID AS SampleID, ORD.Requested_Ordered_Date_and_Time AS RequestDateTime,
CMO.text as OrderComment

FROM CHEMISTRYANALYZER.patient_view PT

JOIN CHEMISTRYANALYZER.order_view ORD
ON PT.Patient_ID = ORD.Patient_ID

LEFT JOIN CHEMISTRYANALYZER.Comment_Orden CMO
ON  ORD.Orden_ID = CMO.Orden_ID

WHERE startswith(Patient_Name_Name_First_name,'MONKEY') )
