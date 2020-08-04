SELECT ru.objectid
      ,ru.id
      ,ru.date
      ,ru.pregnancyid
      ,ru.project
      ,ru.restraint
      ,ru.fetal_heartbeat
      ,ru.performedby
      ,ru.remark
      ,(select ur.completed from ultrasound_review ur where ur.taskid = ru.taskid) as completed
      ,ru.taskid
  FROM research_ultrasounds ru
ORDER BY ru.date DESC