SELECT

    w.remark,
    w.id,
    w.DateChanged,
    w.project
    /*timestampdiff('SQL_TSI_DAY', w.DateChanged, now()) AS DaysSinceFeedingChange,*/

FROM (

         SELECT m.Id, m.remark, t.DateChanged, m.project
         FROM (
                  SELECT
                      w.Id AS Id,
                      max(w.date) AS DateChanged

                  FROM study.NecropsyAbstract w
                      /*WHERE w.qcstate.publicdata = true and w.weight is not null*/
                  GROUP BY w.id
              ) t JOIN study.NecropsyAbstract m ON m.Id = t.Id AND t.DateChanged = m.date
) w