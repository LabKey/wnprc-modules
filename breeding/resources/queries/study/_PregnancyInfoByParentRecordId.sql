PARAMETERS ( PARENT_RECORD_ID VARCHAR )
    SELECT CASE WHEN (p.objectid = PARENT_RECORD_ID) THEN ('*') ELSE NULL END "*"
          ,p.Id
          ,p.sire_id
          ,p.breeding_start_date
          ,p.breeding_end_date
          ,p.breeding_reason
          ,p.breeding_comment
          ,p.outcome
          ,p.outcome_date
          ,p.infant_id
      FROM pregnancies p
     WHERE p.Id IN (SELECT Id FROM pregnancies p2 WHERE p2.objectid = PARENT_RECORD_ID)
     ORDER BY p.outcome_date DESC