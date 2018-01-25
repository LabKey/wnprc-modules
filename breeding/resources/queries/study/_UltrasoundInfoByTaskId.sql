PARAMETERS ( TASK_ID VARCHAR )
    SELECT u.date
          ,u.remark
          ,u.performedby
      FROM ultrasounds u
     WHERE u.taskid = TASK_ID
     ORDER BY u.date DESC