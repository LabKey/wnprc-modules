SELECT 'EDIT' as editLink,participantid,date,enddate,proceduretype,procedurename,location,project,account,
      surgeon,consultRequest,biopsyNeeded,surgerytechneeded,spineeded,vetneeded,statuschangereason,qcstate,
      requestid,(select formtype from ehr.requests where requestid = sp.requestid) as formtype
FROM study.surgery_procedure sp
WHERE sp.requestid IN
      (SELECT r.requestid FROM ehr.requests r
      WHERE ISMEMBEROF(r.createdby) AND r.formtype in ('SurgeryProcedureRequest', 'SurgeryProcedureMultipleRequest'));