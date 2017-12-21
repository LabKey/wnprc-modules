PARAMETERS ( PARENT_RECORD_ID VARCHAR )
    SELECT u.Id
          ,u.Date
          ,u.Performed_By
          ,u.Remark
      FROM ultrasounds u
     WHERE u.Id IN (SELECT Id FROM pregnancies p WHERE p.objectid = PARENT_RECORD_ID)