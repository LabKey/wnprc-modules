PARAMETERS ( TASK_ID VARCHAR )
    SELECT br.date
          ,br.remark
          ,br.performedby
      FROM breeding_remarks br
     WHERE br.taskid = TASK_ID
     ORDER BY br.date DESC