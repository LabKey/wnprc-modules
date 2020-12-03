SELECT
    w.id,
    w.MostRecentBCSDate,
    (SELECT max(score)
     FROM study.bcs w2
     WHERE w.id=w2.id AND w.MostRecentBCSDate=w2.date
    ) AS score

FROM (
         SELECT
             w.Id AS Id,
             max(w.date) AS MostRecentBCSDate
         FROM study.bcs w
         WHERE  w.score is not null
         GROUP BY w.id
     ) w

