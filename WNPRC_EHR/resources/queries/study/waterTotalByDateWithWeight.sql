/*Using the waterTotalByDate this query adds the weight and the condition at the particular
  date.The weight query only selects animal with weights with from January 1, 2021. This limitation
  was done due to performance reasons and to include the same records as waterTotalByDate. In the future
  there may be a need to limit to 90 days in the pass when this query becomes too slow.*/

SELECT wtbd.id,
       wtbd.date,
       weigthDates.weight,
       weigthDates.startDate,
       TRUNCATE(ROUND(CAST(wtbd.TotalWater/weigthDates.weight AS NUMERIC),2),2) AS mlsPerKg,
       wtbd.TotalWater,
       wtbd.volumeGivenInLabSub,
       wtbd.volumeGivenInCage,
       wtbd.volumeGivenInImage,
       wtbd.volumeGivenInProcedure,
       wtbd.currentWaterCondition,
       waterScheduledAnimalsOuter.condition AS conditionAtTime,
       wtbd.project,
       wtbd.performedConcat,
       wtbd.qcstate
FROM study.waterTotalByDate wtbd

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

      FROM study.weight i

        --WHERE i.date > timestampadd('SQL_TSI_DAY', -90, CAST(curdate() AS TIMESTAMP))
        WHERE i.date > '2021-01-01'

     ) weigthDates
--ON cal.targetdate >= weigthDates.startDate AND cal.targetdate < weigthDates.endDate
ON wtbd.date >= weigthDates.startDate AND wtbd.date < weigthDates.endDate AND weigthDates.id = wtbd.id

JOIN
     (SELECT
          wsa.id,
          wsa.condition ,
          CAST (wsa.date AS DATE) AS startDate,
          COALESCE(
                  CAST((SELECT wsa2.date FROM study.waterScheduledAnimals wsa2
                        WHERE wsa2.date>wsa.date AND wsa2.id = wsa.id
                        ORDER BY wsa2.date asc limit 1
                  ) AS DATE)
              ,timestampadd('SQL_TSI_DAY',1,CAST(curdate() AS TIMESTAMP))) AS endDate

      FROM study.waterScheduledAnimals wsa

     ) waterScheduledAnimalsOuter
     ON wtbd.date >= waterScheduledAnimalsOuter.startDate
            AND wtbd.date < waterScheduledAnimalsOuter.endDate
            AND waterScheduledAnimalsOuter.id = wtbd.id

--WHERE wtbd.date > timestampadd('SQL_TSI_DAY', -90, CAST(curdate() AS TIMESTAMP))

ORDER BY date DESC