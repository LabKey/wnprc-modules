SELECT 'EDIT' as editLink,participantid,date,enddate,proceduretype,procedurename,location,project,account,surgeon,surgerytechneeded,spineeded,vetneeded,statuschangereason,qcstate,lsid FROM study.surgery_procedure sp
WHERE sp.requestid IN
      (SELECT r.requestid FROM ehr.requests r
      WHERE ISMEMBEROF(r.createdby) AND r.formtype in ('SurgeryProcedureRequest', 'SurgeryProcedureMultipleRequest') AND r.qcstate in (7,12));

--SELECT * FROM ehr.requests