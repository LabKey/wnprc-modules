PARAMETERS ( PARENT_RECORD_ID VARCHAR )
    SELECT br.date
          ,br.remark
          ,br.performedby
      FROM breeding_remarks br
     WHERE br.parentid = PARENT_RECORD_ID
     ORDER BY br.date DESC