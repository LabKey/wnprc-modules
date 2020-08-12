SELECT ru.objectid
      ,ru.id
      ,ru.date
      ,ru.pregnancyid
      ,CASE WHEN EXISTS(SELECT 1 FROM pregnancy_outcomes po WHERE ru.pregnancyid = po.pregnancyid)
              THEN 'Pregnancy Completed'
            WHEN EXISTS(SELECT 1 FROM pregnancies p WHERE ru.pregnancyid = p.lsid)
                  THEN CONCAT(CAST((SELECT timestampdiff('SQL_TSI_DAY', p.date_conception, ru.date)
                         FROM pregnancies p
                         WHERE ru.pregnancyid = p.lsid) AS VARCHAR), ' day(s)')
            ELSE 'No Associated Pregnancy'
       END AS gestation_day
      ,ru.project
      ,ru.restraint
      ,ru.fetal_heartbeat
      ,ru.performedby
      ,ru.remark
      ,COALESCE((
                SELECT ur.completed
                FROM ultrasound_review ur
                WHERE ur.taskid = ru.taskid), 'false')
                AS completed
      ,ru.taskid
  FROM research_ultrasounds ru
ORDER BY ru.date DESC