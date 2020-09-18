SELECT p.objectid
      ,p.id
      ,p.sireid
      ,p.date
      ,to_char(p.date_conception, 'yyyy-MM-dd') AS date_conception
      , CASE
          WHEN p.date_conception_early IS NOT NULL AND p.date_conception_late IS NOT NULL THEN
            (to_char(p.date_conception_early, 'yyyy-MM-dd') || ' to ' || to_char(p.date_conception_late, 'yyyy-MM-dd'))
          ELSE
            'N/A'
        END AS conception_range
      , CASE
          WHEN p.date_conception_early IS NOT NULL AND p.date_conception_late IS NOT NULL THEN
            (to_char(timestampadd('SQL_TSI_DAY',  30,  p.date_conception_early), 'yyyy-MM-dd') || ' to ' || to_char(timestampadd('SQL_TSI_DAY',  30,  p.date_conception_late), 'yyyy-MM-dd'))
          ELSE
            (to_char(timestampadd('SQL_TSI_DAY', 30, p.date_conception), 'yyyy-MM-dd'))
        END AS date_conception_plus_30
      , CASE
          WHEN p.date_conception_early IS NOT NULL AND p.date_conception_late IS NOT NULL THEN
            (to_char(timestampadd('SQL_TSI_DAY',  60,  p.date_conception_early), 'yyyy-MM-dd') || ' to ' || to_char(timestampadd('SQL_TSI_DAY',  60,  p.date_conception_late), 'yyyy-MM-dd'))
          ELSE
            (to_char(timestampadd('SQL_TSI_DAY', 60, p.date_conception), 'yyyy-MM-dd'))
        END AS date_conception_plus_60
      , CASE
          WHEN p.date_conception_early IS NOT NULL AND p.date_conception_late IS NOT NULL THEN
            (to_char(timestampadd('SQL_TSI_DAY',  90,  p.date_conception_early), 'yyyy-MM-dd') || ' to ' || to_char(timestampadd('SQL_TSI_DAY',  90,  p.date_conception_late), 'yyyy-MM-dd'))
          ELSE
            (to_char(timestampadd('SQL_TSI_DAY', 90, p.date_conception), 'yyyy-MM-dd'))
        END AS date_conception_plus_90
      , CASE
          WHEN p.date_conception_early IS NOT NULL AND p.date_conception_late IS NOT NULL THEN
            (to_char(timestampadd('SQL_TSI_DAY',  120,  p.date_conception_early), 'yyyy-MM-dd') || ' to ' || to_char(timestampadd('SQL_TSI_DAY',  120,  p.date_conception_late), 'yyyy-MM-dd'))
          ELSE
            (to_char(timestampadd('SQL_TSI_DAY', 120, p.date_conception), 'yyyy-MM-dd'))
        END AS date_conception_plus_120
      , CASE
          WHEN p.date_conception_early IS NOT NULL AND p.date_conception_late IS NOT NULL THEN
            (to_char(timestampadd('SQL_TSI_DAY',  150,  p.date_conception_early), 'yyyy-MM-dd') || ' to ' || to_char(timestampadd('SQL_TSI_DAY',  150,  p.date_conception_late), 'yyyy-MM-dd'))
          ELSE
            (to_char(timestampadd('SQL_TSI_DAY', 150, p.date_conception), 'yyyy-MM-dd'))
        END AS date_conception_plus_150
      , CASE
          WHEN p.date_conception_early IS NOT NULL AND p.date_conception_late IS NOT NULL THEN
            (to_char(timestampadd('SQL_TSI_DAY',  165,  p.date_conception_early), 'yyyy-MM-dd') || ' to ' || to_char(timestampadd('SQL_TSI_DAY',  165,  p.date_conception_late), 'yyyy-MM-dd'))
          ELSE
            (to_char(timestampadd('SQL_TSI_DAY', 165, p.date_conception), 'yyyy-MM-dd'))
        END AS date_conception_plus_165
      , CASE
          WHEN p.date_due_early IS NOT NULL AND p.date_due_late IS NOT NULL THEN
            (to_char(p.date_due_early, 'yyyy-MM-dd') || ' to ' || to_char(p.date_due_late, 'yyyy-MM-dd'))
          ELSE
            'N/A'
        END AS date_due_range
      , CASE
          WHEN p.date_conception_late IS NOT NULL AND p.date_conception_early IS NOT NULL THEN
            (timestampdiff('SQL_TSI_DAY', p.date_conception_late, coalesce(po.date, curdate())) || ' to ' || timestampdiff('SQL_TSI_DAY', p.date_conception_early, coalesce(po.date, curdate())))
          ELSE
            'N/A'
        END AS gestation_day_range
      ,to_char(p.date_due, 'yyyy-MM-dd') AS date_due
      ,timestampdiff('SQL_TSI_DAY', p.date_conception, coalesce(po.date, curdate())) AS gestation_day
      ,po.outcome
      ,po.date outcome_date
      ,po.remark outcome_remark
      ,po.infantid
  FROM pregnancies p
    -- select only the most recent outcome, in case there are multiple outcomes
    -- (note that we do not expect there to be multiples, but just in case)
  LEFT OUTER JOIN pregnancy_outcomes po
    ON po.objectid = (SELECT objectid
                        FROM pregnancy_outcomes
                       WHERE pregnancyid = p.lsid
                       ORDER BY date DESC
                       LIMIT 1)
ORDER BY p.date_conception DESC