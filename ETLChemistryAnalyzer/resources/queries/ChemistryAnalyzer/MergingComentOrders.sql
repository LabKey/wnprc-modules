/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(SELECT
Laboratory_Assigned_Patient_ID AS Id, PT.Patient_ID,
ORD.Orden_ID as Orden_ID, ORD.Sample_ID AS SampleID, ORD.Requested_Ordered_Date_and_Time AS RequestDateTime,
RST.Universal_Test_ID AS testid, RST.oor, RST.result_value, RST.Unit,
CMO.text as OrderComment

FROM CHEMISTRYANALYZER.patient_view PT

JOIN CHEMISTRYANALYZER.order_view ORD
ON PT.Patient_ID = ORD.Patient_ID

JOIN CHEMISTRYANALYZER.result_view RST
ON ORD.Orden_ID = RST.Orden_ID

LEFT JOIN CHEMISTRYANALYZER.Comment_Orden CMO
ON  ORD.Orden_ID = CMO.Orden_ID

WHERE startswith(Patient_Name_Name_First_name,'MONKEY') )
