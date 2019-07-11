SELECT
GROUPRESULTS.Sample_ID, GROUPRESULTS.RequestDateTime as RequestDateTime,
GROUPRESULTS.testid, GROUPRESULTS.resultOORIndicator, GROUPRESULTS.result, GROUPRESULTS.units,
GROUPRESULTS.OrderComment, GROUPRESULTS.OrderDate, GROUPRESULTS.CommentText,
PT.Patient_ID, PT.Laboratory_Assigned_Patient_ID AS Id, PT.Patient_Name_Name_First_name, Birthdate, Patient_Sex, Special_Field_1,
HDR.Header_ID,HDR.Date_and_Time AS headerDate,
-- adding unique identifier for same sample_id if set is ran twice
(GROUPRESULTS.Sample_ID || PT.Laboratory_Assigned_Patient_ID || GROUPRESULTS.RequestDateTime || GROUPRESULTS.testid) AS alternateIdentifier
FROM
(
    SELECT

    MAX(ORD.Patient_ID) AS Patient_ID, MAX(ORD.Orden_ID) AS Orden_ID, ORD.Requested_Ordered_Date_and_Time AS RequestDateTime,ORD.Sample_ID,
    MAX(CMO.text) as OrderComment, MAX(CMO.comment_text) AS CommentText,
    -- MAX(CMO.order_date) AS OrderDate,
    
    --If there is not comment we add the RequestOrderedDateandTime coming from the order_view table
    --OrderDate cannot be null for the ETL process to work.
    CASE
    WHEN MAX(CMO.text) IS NULL THEN ORD.Requested_Ordered_Date_and_Time
    ELSE MAX(CMO.order_date)
    END AS OrderDate,

    RST.Universal_Test_ID AS testid, MAX(RST.oor) AS resultOORIndicator ,

    -- Check if same test ran twice and have different values displays '-1'
    CASE
    WHEN MAX(RST.result_value) = MIN(RST.result_value) THEN RST.result_value

    ELSE -1

    END AS result,

    MAX(RST.Unit) AS units

    FROM CHEMISTRYANALYZER.order_view ORD

    JOIN  CHEMISTRYANALYZER.result_view RST
    ON ORD.Orden_ID = RST.Orden_ID
    
    --Duplicating comments from first order in the set to all the orders with the same Orden_ID
    LEFT JOIN (SELECT CMO2.text, CMO2.order_date, CMO2.comment_text, CMO2.Orden_ID, ORD2.Patient_ID AS PTID2
            FROM CHEMISTRYANALYZER.comment_order_view CMO2
            JOIN CHEMISTRYANALYZER.order_view ORD2
            ON CMO2.Orden_ID = ORD2.Orden_ID
            ) CMO
    ON CMO.PTID2 = ORD.Patient_ID

    GROUP BY RST.Universal_Test_ID, ORD.Sample_ID, ORD.Requested_Ordered_Date_and_Time

) GROUPRESULTS

JOIN CHEMISTRYANALYZER.patient_view PT
ON PT.Patient_ID = GROUPRESULTS.Patient_ID

JOIN CHEMISTRYANALYZER.header_view HDR
    ON HDR.Header_ID = PT.Header_ID

WHERE startswith(Patient_Name_Name_First_name,'MONKEY') AND HDR.Date_and_Time >='2019-07-08'
