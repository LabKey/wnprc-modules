PARAMETERS ( PARENT_RECORD_ID VARCHAR )
    SELECT u.date
          ,u.remark
          ,u.performedby
      FROM ultrasounds u
     WHERE u.parentid = PARENT_RECORD_ID
     ORDER BY u.date DESC