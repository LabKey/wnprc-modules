/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*
 * This query defines an extension on the Id column that other queries can use as an automatic lookup, and is
 * added in WNPRC_EHRCustomizer.java.  It gives a concatenated summary of recent observations from yesterday and today.
 */

SELECT
yesterdaysObs.id,
cast(cast(TIMESTAMPADD('SQL_TSI_DAY', -1, now()) AS DATE) AS TIMESTAMP) as yesterday,
group_concat(yesterdaysObs.description) as previousObs

FROM (
    SELECT
    obs.id,
    CASE
      WHEN (obs.remark is null     and obs.description is not null) THEN obs.description
      WHEN (obs.remark is not null and obs.description is null)     THEN obs.remark
      WHEN (obs.remark is not null and obs.description is not null) THEN (obs.remark||';'||obs.description)
      ELSE NULL
    END as description
    FROM study."Irregular Obs No Okays" obs
    WHERE (
      -- Look for obs that were recorded either today or yesterday
      CAST(obs.date AS DATE) = cast(TIMESTAMPADD('SQL_TSI_DAY', -1, now()) AS DATE)
      OR
      CAST(obs.date AS DATE) = cast(now() AS DATE)
    )
) yesterdaysObs

GROUP BY yesterdaysObs.id
