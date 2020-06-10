/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

    w.id,
    w.type_lookup,
    w.MostRecentFeedingDate,
    timestampdiff('SQL_TSI_DAY', w.MostRecentFeedingDate, now()) AS DaysSinceFeedingChange,

    cast((
        SELECT round(cast(AVG(w2.amount) as double), 2) AS _expr
        FROM study.feeding w2
        WHERE w.id=w2.id AND w.MostRecentFeedingDate=w2.date
    ) as double) AS MostRecentFeedingAmount

FROM (

         SELECT m.Id, m.type_lookup, t.MostRecentFeedingDate
         FROM (
                  SELECT
                      w.Id AS Id,
                      max(w.date) AS MostRecentFeedingDate

                  FROM study.feeding w
                      /*WHERE w.qcstate.publicdata = true and w.weight is not null*/
                  GROUP BY w.id
              ) t JOIN study.feeding m ON m.Id = t.Id AND t.MostRecentFeedingDate = m.date;


     ) w

