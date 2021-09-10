SELECT weigthDates.id,
       cal.targetdate as date,
       weigthDates.weight,
       weigthDates.startDate AS weightDate

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
              ,timestampadd('SQL_TSI_DAY',1,CAST(curdate() AS TIMESTAMP))) AS endDate

      FROM study.weight i WHERE i.id IN (SELECT Id FROM study.waterScheduledAnimals)
                            --AND i.date > '2021-01-01'
                            AND i.date > timestampadd('SQL_TSI_DAY', -90, CAST(curdate() AS TIMESTAMP))
                            --order by i.date desc
      --FROM study.weight i WHERE i.id = 'r04169' AND i.date > '2021-01-01'
     ) weigthDates
ON cal.targetdate >= weigthDates.startDate AND cal.targetdate < weigthDates.endDate
WHERE cal.targetdate > timestampadd('SQL_TSI_DAY', -90, CAST(curdate() AS TIMESTAMP))
--WHERE cal.targetdate > '2021-01-01'
ORDER BY date DESC