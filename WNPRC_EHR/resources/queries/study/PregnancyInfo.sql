SELECT p.objectid
      ,p.id
      ,p.sireid
      ,p.date
      ,p.date_conception
      ,timestampadd('SQL_TSI_DAY', 30,  p.date_conception) date_conception_plus_30
      ,timestampadd('SQL_TSI_DAY', 60,  p.date_conception) date_conception_plus_60
      ,timestampadd('SQL_TSI_DAY', 90,  p.date_conception) date_conception_plus_90
      ,timestampadd('SQL_TSI_DAY', 120, p.date_conception) date_conception_plus_120
      ,timestampadd('SQL_TSI_DAY', 150, p.date_conception) date_conception_plus_150
      ,timestampadd('SQL_TSI_DAY', 165, p.date_conception) date_conception_plus_165
      ,p.date_due
      ,timestampdiff('SQL_TSI_DAY', p.date_conception, coalesce(po.date, curdate())) gestation_day
      ,po.outcome
      ,po.date outcome_date
      ,po.remark outcome_remark
      ,po.infantid
      ,'EDIT' updatelink
  FROM pregnancies p
    -- select only the most recent outcome, in case there are multiple outcomes
    -- (note that we do not expect there to be multiples, but just in case)
  LEFT OUTER JOIN pregnancy_outcomes po
    ON po.objectid = (SELECT objectid
                        FROM pregnancy_outcomes
                       WHERE pregnancyid = p.lsid
                       ORDER BY date DESC
                       LIMIT 1)