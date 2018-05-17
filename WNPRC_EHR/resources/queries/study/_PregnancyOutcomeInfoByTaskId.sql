PARAMETERS ( TASK_ID VARCHAR )
    SELECT po.date
          ,po.outcome
          ,po.infantid
          ,po.remark
          ,po.performedby
      FROM pregnancy_outcomes po
     WHERE po.taskid = TASK_ID
     ORDER BY po.date DESC