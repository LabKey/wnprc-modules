SELECT 'EDIT' as editLink,participantid,date,enddate,proceduretype,procedurename,location,project,account,surgeon,surgerytechneeded,spineeded,vetneeded,statuschangereason,qcstate,lsid FROM study.surgery_procedure sp
WHERE sp.requestid IN
      (SELECT r.requestid FROM ehr.requests r
      WHERE ISMEMBEROF(r.createdby) AND r.formtype = 'SurgeryProcedureRequest' AND r.qcstate = 7);

--SELECT * FROM ehr.requests