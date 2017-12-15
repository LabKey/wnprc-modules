SELECT p.objectid
      ,p.Id
      ,p.sire_id
      ,p.breeding_start_date
      ,p.breeding_end_date
      ,p.breeding_reason
      ,p.breeding_comment
      ,p.estimated_conception_date
      ,timestampadd('SQL_TSI_DAY', 30,  p.estimated_conception_date) estimated_conception_date_plus_30
      ,timestampadd('SQL_TSI_DAY', 60,  p.estimated_conception_date) estimated_conception_date_plus_60
      ,timestampadd('SQL_TSI_DAY', 90,  p.estimated_conception_date) estimated_conception_date_plus_90
      ,timestampadd('SQL_TSI_DAY', 120, p.estimated_conception_date) estimated_conception_date_plus_120
      ,timestampadd('SQL_TSI_DAY', 150, p.estimated_conception_date) estimated_conception_date_plus_150
      ,timestampadd('SQL_TSI_DAY', 165, p.estimated_conception_date) estimated_conception_date_plus_165
      ,p.ultrasound_date
      ,p.ultrasound_comment
      ,p.ejaculation_confirmation
      ,p.outcome
      ,p.outcome_comment
      ,p.outcome_date
      ,p.infant_id
  FROM pregnancies p