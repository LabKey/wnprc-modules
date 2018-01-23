PARAMETERS ( TASK_ID VARCHAR )
    SELECT be.objectid
          ,CASE WHEN (be.taskid = TASK_ID) THEN ('*') ELSE NULL END "*"
          ,be.sireid
          ,be.date
          ,be.dateend
          ,be.reason
          ,br.remark
          ,be.conceptiondate
          ,po.outcome
          ,po.date outcome_date
          ,po.remark outcome_remark
          ,po.infantid
      FROM breeding_encounters be
        -- select only the most recent outcome, in case there are multiple outcomes
        -- (note that we do not expect there to be multiples, but just in case)
      LEFT OUTER JOIN pregnancy_outcomes po
        ON po.objectid = (SELECT objectid
                            FROM pregnancy_outcomes
                           WHERE taskid = be.taskid
                           ORDER BY date DESC
                           LIMIT 1)
        -- select the most recent remark to show in the list
      LEFT OUTER JOIN breeding_remarks br
        ON br.objectid = (SELECT objectid
                            FROM breeding_remarks
                           WHERE taskid = be.taskid
                           ORDER BY date DESC
                           LIMIT 1)
        -- select all the pregnancies for the dam of the selected parent record
     WHERE be.id IN (SELECT id
                       FROM breeding_encounters be2
                      WHERE be2.taskid = TASK_ID)
       AND be.conceptiondate IS NOT NULL
     ORDER BY po.date DESC