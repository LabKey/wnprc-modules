SELECT objectid,
       room,
       date,
       enddate,
       event_id,
       requestid,
       requestid.qcstate.label as qclabel
FROM wnprc.procedure_scheduled_rooms