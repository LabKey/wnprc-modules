SELECT ru.objectid
      ,ru.id
      ,ru.date
      ,ru.pregnancyid
      ,ru.project
      ,ru.restraint
      ,ru.fetal_heartbeat
      ,ru.performedby
      ,ru.remark
      ,ru.taskid
  FROM research_ultrasounds ru
ORDER BY ru.date DESC