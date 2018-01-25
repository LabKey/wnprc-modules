/*
 * Note that this query is incredibly slow.  It is meant to provide information through the cached
 * MostRecentObsDemographicsProvider class.
 */

SELECT
  lastob.Id,
  lastob.lastdate as lastObservationDate,
  remark   as lastObservationRemark,
  feces    as lastObservationFeces,
  menses   as lastObservationMenses,
  other    as lastObservationOther,
  behavior as lastObservationBehavior,
  breeding as lastObservationBreeding

FROM
(
    SELECT Id, MAX(date) as lastdate FROM study.obs
    WHERE isIrregular = TRUE
    GROUP BY Id
) as lastob

INNER JOIN study.obs irobs
ON lastob.lastdate = irobs.date AND lastob.Id = irobs.Id