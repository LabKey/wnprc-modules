--Query for the Research Ultrasounds view

SELECT ru.objectid
      ,ru.id
      ,ru.date
      ,ru.pregnancyid
      --Show the pregnancy status
      ,CASE WHEN EXISTS(SELECT 1 FROM pregnancy_outcomes po WHERE ru.pregnancyid = po.pregnancyid)
              THEN 'Pregnancy Completed'
            WHEN EXISTS(SELECT 1 FROM pregnancies p WHERE ru.pregnancyid = p.lsid)
                  THEN CONCAT(CAST((SELECT timestampdiff('SQL_TSI_DAY', p.date_conception, ru.date)
                         FROM pregnancies p
                         WHERE ru.pregnancyid = p.lsid) AS VARCHAR), ' day(s)')
            ELSE 'No Associated Pregnancy'
       END AS gestation_day
      ,ru.project
      ,(SELECT r.restraintType FROM restraints r WHERE ru.taskid = r.taskid) as restraint
      ,ru.fetal_heartbeat
      ,ru.performedby
      ,ru.remark
      ,CASE
      --Show if the review is completed or not
      --This is N/A if the record was bulk uploaded
        WHEN (SELECT ur.completed
                FROM ultrasound_review ur
                WHERE ur.taskid = ru.taskid) = TRUE THEN 'Yes'
        WHEN (ru.qcstate.Label = 'Completed') THEN 'N/A (bulk upload)'
        WHEN (SELECT ur.completed
                FROM ultrasound_review ur
                WHERE ur.taskid = ru.taskid) IS FALSE THEN 'No'
        ELSE 'No'
      END AS reviewCompleted
      ,ru.taskid
  FROM research_ultrasounds ru
ORDER BY ru.date DESC