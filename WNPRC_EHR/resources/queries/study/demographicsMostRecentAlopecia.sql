SELECT
    w.id,
    w.MostRecentAlopeciaDate,
    (SELECT max(score)
     FROM study.alopecia w2
     WHERE w.id=w2.id AND w.MostRecentAlopeciaDate=w2.date
    ) AS score

FROM (
         SELECT
             w.Id AS Id,
             max(w.date) AS MostRecentAlopeciaDate
         FROM study.alopecia w
         WHERE  w.score is not null
         GROUP BY w.id
     ) w
