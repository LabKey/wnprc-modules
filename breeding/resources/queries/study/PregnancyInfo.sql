SELECT be.objectid
      ,be.taskid
      ,be.id
      ,be.sireid
      ,be.date
      ,be.dateend
      ,be.reason
      ,br.remark
      ,be.conceptiondate
      ,timestampadd('SQL_TSI_DAY', 30,  be.conceptiondate) conceptiondate_plus_30
      ,timestampadd('SQL_TSI_DAY', 60,  be.conceptiondate) conceptiondate_plus_60
      ,timestampadd('SQL_TSI_DAY', 90,  be.conceptiondate) conceptiondate_plus_90
      ,timestampadd('SQL_TSI_DAY', 120, be.conceptiondate) conceptiondate_plus_120
      ,timestampadd('SQL_TSI_DAY', 150, be.conceptiondate) conceptiondate_plus_150
      ,timestampadd('SQL_TSI_DAY', 165, be.conceptiondate) conceptiondate_plus_165
      ,timestampdiff('SQL_TSI_DAY', be.conceptiondate, coalesce(po.date, curdate())) gestation_day
      ,be.ejaculation
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