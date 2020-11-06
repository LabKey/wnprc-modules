SELECT

    w.source,
    w.id,
    w.DateChanged

FROM (
         SELECT m.id, m.source, t.DateChanged
         FROM (
                  SELECT
                      w.id AS id,
                      min(w.date) AS DateChanged

                  FROM
                      (SELECT
                           a.source as source,
                           a.id as id,
                           a.date as date
                       FROM study.arrival a WHERE source is not null

                       UNION ALL

                       SELECT
                           b.origin as source,
                           b.id as id,
                           b.date as date
                       FROM study.birth b WHERE origin is not null ) w
                  GROUP BY w.id
              ) t JOIN

              (SELECT
                   a.source as source,
                   a.id as id,
                   a.date as date
               FROM study.arrival a WHERE source is not null

               UNION ALL

               SELECT
                   b.origin as source,
                   b.id as id,
                   b.date as date
               FROM study.birth b WHERE origin is not null ) m ON m.Id = t.Id AND t.DateChanged = m.date
) w