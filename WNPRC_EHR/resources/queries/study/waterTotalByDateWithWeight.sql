/*Using the waterTotalByDate this query adds the weight and the condition at the particular
  date.The weight query only selects animal with weights with from January 1, 2021. This limitation
  was done due to performance reasons and to include the same records as waterTotalByDate. In the future
  there may be a need to limit to 90 days in the pass when this query becomes too slow.*/

SELECT wtbd.Id as Id,
       wtbd.date,
       wtbd.reportEndDate,
       weigthDates.weight,
       weigthDates.startDate,
       TRUNCATE(ROUND(CAST(wtbd.TotalWater/weigthDates.weight AS NUMERIC),2),2) AS mlsPerKg,
       wtbd.TotalWater,
       wtbd.volumeGivenInLabSub,
       wtbd.volumeGivenInCage,
       wtbd.volumeGivenInImage,
       wtbd.volumeGivenInProcedure,
       wtbd.currentWaterCondition,
       wtbd.remarksConcat,
       waterScheduledAnimalsOuter.condition AS conditionAtTime,
       waterScheduledAnimalsOuter.endDate as endDateCondition,

       CAST(waterScheduledAnimalsOuter.mlsperKg AS NUMERIC) AS InnerMlsPerKg,
       waterScheduledAnimalsOuter.project,
       wtbd.performedConcat,
       wtbd.qcstate,
       COALESCE(CAST(wtbd.TotalWater/weigthDates.weight AS NUMERIC), 0) AS zeroOrmlsPerKg,
       'waterTotal' AS dataSource
FROM study.waterTotalByDate wtbd

JOIN
     (SELECT
          i.Id,
          i.weight ,
          CAST (i.date AS DATE) AS startDate,
          COALESCE(
                  CAST((SELECT i2.date FROM study.weight i2
                        WHERE i2.date>i.date AND i2.Id = i.Id
                        ORDER BY i2.date asc limit 1
                  ) AS DATE)
              ,timestampadd('SQL_TSI_DAY',120,CAST(curdate() AS TIMESTAMP))) AS endDate
--              ,wtbd.reportEndDate) AS endDate

      FROM study.weight i

        --WHERE i.date > timestampadd('SQL_TSI_DAY', -90, CAST(curdate() AS TIMESTAMP))
        WHERE i.date > '2021-01-01'

     ) weigthDates
--ON cal.targetdate >= weigthDates.startDate AND cal.targetdate < weigthDates.endDate
ON wtbd.date >= weigthDates.startDate AND wtbd.date < weigthDates.endDate AND weigthDates.Id = wtbd.Id

JOIN
     (SELECT
          wsa.Id,
          wsa.condition,
          wsa.mlsperKg,
          wsa.project,
          CAST (wsa.date AS DATE) AS startDate,
          COALESCE(
                  CAST((SELECT wsa2.date FROM study.waterScheduledAnimals wsa2
                        WHERE wsa2.date>wsa.date AND wsa2.Id = wsa.Id
                        ORDER BY wsa2.date asc limit 1
                  ) AS DATE)
              ,timestampadd('SQL_TSI_DAY',120,CAST(curdate() AS TIMESTAMP))) AS endDate
--              ,wtbd.reportEndDate) AS endDate

      FROM study.waterScheduledAnimals wsa

     ) waterScheduledAnimalsOuter
     ON wtbd.date >= waterScheduledAnimalsOuter.startDate
            AND wtbd.date < waterScheduledAnimalsOuter.endDate
            AND waterScheduledAnimalsOuter.Id = wtbd.Id

--WHERE wtbd.date > timestampadd('SQL_TSI_DAY', -90, CAST(curdate() AS TIMESTAMP))

ORDER BY date DESC