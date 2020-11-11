SELECT

    w.score,
    w.id,
    w.DateChanged
    /*timestampdiff('SQL_TSI_DAY', w.DateChanged, now()) AS DaysSinceFeedingChange,*/

FROM (

         SELECT m.Id, m.score, t.DateChanged
         FROM (
                  SELECT
                      w.Id AS Id,
                      max(w.date) AS DateChanged

                  FROM study.alopecia w
                      /*WHERE w.qcstate.publicdata = true and w.weight is not null*/
                  GROUP BY w.id
              ) t JOIN study.alopecia m ON m.Id = t.Id AND t.DateChanged = m.date;


) w