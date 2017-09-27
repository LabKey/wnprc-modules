/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query contains a handful of calculated fields for the weights table
--it is designed to be joined into weights using lsid

SELECT
  w.lsid,
  w.Id,
  w.date,
--   w.Id.dataset.demographics.wdate as LatestWeightDate,
--   w.Id.dataset.demographics.weight AS LatestWeight,
  w.Id.MostRecentWeight.MostRecentWeightDate as LatestWeightDate,
  w.Id.MostRecentWeight.MostRecentWeight AS LatestWeight,

  timestampdiff('SQL_TSI_DAY', w.date, w.Id.MostRecentWeight.MostRecentWeightDate) AS IntervalInDays,
  age_in_months(w.date, w.Id.MostRecentWeight.MostRecentWeightDate) AS IntervalInMonths,

  w.weight,
  CASE WHEN w.date >= timestampadd('SQL_TSI_DAY', -730, w.Id.MostRecentWeight.MostRecentWeightDate) THEN
    Round(((w.Id.MostRecentWeight.MostRecentWeight - w.weight) * 100 / w.weight), 1)
  ELSE
    null
  END  AS PctChange,

  CASE WHEN w.date >= timestampadd('SQL_TSI_DAY', -730, w.Id.MostRecentWeight.MostRecentWeightDate) THEN
    Abs(Round(((w.Id.MostRecentWeight.MostRecentWeight - w.weight) * 100 / w.weight), 1))
  else
    null
  END  AS AbsPctChange,
  w.qcstate

FROM study.weight w

WHERE w.qcstate.publicdata = true