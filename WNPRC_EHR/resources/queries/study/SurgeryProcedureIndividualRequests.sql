SELECT CASE WHEN sp.qcstate.label = 'Request: Denied' THEN 'EDIT' ELSE '' END as editLink,
       sp.Id,
       sp.date,
       sp.enddate,
       sp.procedurename,
       sp.procedureunit.unit_display_name AS procedureunit,
       sp.project,
       sp.account,
       sp.surgeon,
       sp.consultRequest,
       sp.biopsyNeeded,
       sp.surgerytechneeded,
       sp.spineeded,
       sp.vetneeded,
       sp.statuschangereason,
       sp.qcstate,
       sp.requestid,
       (SELECT r.formtype FROM ehr.requests r WHERE r.requestid = sp.requestid)  AS formtype,
       (SELECT group_concat(psr.room, ', ') FROM wnprc.procedure_scheduled_rooms psr WHERE psr.requestid = sp.requestid) as rooms,
       contextPath() || '/wnprc_ehr' || folderPath() || '/dataEntry.view' AS returnUrl
FROM study.surgery_procedure sp
WHERE sp.requestid IN (SELECT r.requestid
                       FROM ehr.requests r
                       WHERE ISMEMBEROF(r.createdby)
                         AND r.formtype in ('SurgeryProcedureRequest', 'MultipleSurgeryProcedureRequest'))
ORDER BY sp.date DESC;