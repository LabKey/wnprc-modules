SELECT weigthDates.id,
       cal.targetdate as date,
       weigthDates.weight

FROM ehr_lookups.calendar cal
JOIN
    (SELECT
        i.id,
        i.weight ,
        CAST (i.date AS DATE) AS startDate,
        COALESCE(
            CAST((SELECT i2.date FROM study.weight i2
                WHERE i2.date>i.date AND i2.id = i.id
                ORDER BY i2.date asc limit 1
            ) AS DATE)
        ,curdate()) AS endDate

    FROM study.weight i  order by i.date desc) weigthDates
    ON cal.targetdate >= weigthDates.startDate AND cal.targetdate < weigthDates.endDate