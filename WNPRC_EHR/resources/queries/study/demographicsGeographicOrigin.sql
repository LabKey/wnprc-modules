SELECT

    case when w.origin = 'cen'
       then 'domestic'
       else
           w.origin
    end as geographic_origin,
    w.id,
    w.DateChanged

FROM (
         SELECT m.id, m.origin, t.DateChanged
         FROM (
                  SELECT
                      w.id AS id,
                      min(w.date) AS DateChanged

                  FROM
                      (SELECT
                           a.geographic_origin as origin,
                           a.id as id,
                           a.date as date
                       FROM study.arrival a WHERE geographic_origin is not null

                       UNION ALL

                       SELECT
                           b.origin as source,
                           b.id as id,
                           b.date as date
                       FROM study.birth b WHERE origin is not null) w
                  GROUP BY w.id
              ) t JOIN

              (SELECT
                   a.geographic_origin as origin,
                   a.id as id,
                   a.date as date
               FROM study.arrival a WHERE geographic_origin is not null

               UNION ALL

               SELECT
                   b.origin as origin,
                   b.id as id,
                   b.date as date
               FROM study.birth b WHERE origin is not null ) m ON m.Id = t.Id AND t.DateChanged = m.date
     ) w