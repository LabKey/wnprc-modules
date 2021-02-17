SELECT DISTINCT
voGi.id as animalId,
CAST (voGi.date AS DATE) AS Date,

--max(wa.volume) AS goal,
--COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.water_given iwg WHERE iwg.id=voGi.id AND (dayofyear(iwg.date)-dayofyear(voGi.date)) =0 AND iwg.assignto LIKE 'laboratory'),0) AS volumeGivenInLab,
voGi.volumeGivenInLabSub,
voGi.volumeGivenInCage,
voGi.volumeGivenInImage,
voGi.volumeGivenInProcedure,

voGi.TotalWater AS TotalWater,
voGi.TotalWater AS volume,
voGi.RecentWeight,
voGi.InnerWeight,


TRUNCATE(ROUND(CAST(voGi.TotalWater /voGi.InnerWeight AS NUMERIC),2),2) AS mlsPerKg,
voGi.InnerWeight*voGi.InnerMlsPerKg - voGi.TotalWater AS WaterRemaining,
--(SELECT waterCond.mlsperKg from study.demographicsMostRecentWaterCondition waterCond WHERE waterCond.id = voGi.id) AS mostRecentMlsPerKg,
voGi.RecentMlsPerKg,
voGi.InnerMlsPerKg,

'waterGiven' AS dataSource
--voGi.Innerweight*20 - voGi.TotalSub AS waterRemaining
--COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.water_given iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0 AND iwg.assignto LIKE 'animalcare'),0) AS volumeGivenInCage,

--(SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.water_given iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0) AS Total,
--((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.water_given iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0)-(20*(SELECT dm.id.MostRecentWeight.MostRecentWeight AS MostRecentWieght FROM study.demographics dm WHERE wa.id = dm.id))) AS Weight

--FROM study.water_given wa

--WHERE wa.Date > '2015-02-13' and  wa.id='r02086'
--WHERE wa.id=wa.id AND (dayofyear(wa.date)-dayofyear(wa.date)) =0

FROM (

    SELECT
        wa.id AS id,
        wa.date AS date,
        COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0 AND iwg.location LIKE 'lab'),0) AS volumeGivenInLabSub,
        COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0 AND iwg.location LIKE 'animalRoom'),0) AS volumeGivenInCage,
        COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0 AND iwg.location LIKE 'imaging'),0) AS volumeGivenInImage,
        COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0 AND iwg.location LIKE 'procedureRoom'),0) AS volumeGivenInProcedure,
        COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0),0) AS TotalWater,
        (SELECT we.weight
            FROM study.weight we
            WHERE we.id = wa.id AND we.date = (
                SELECT MAX(wen.date)
                FROM study.weight wen
                WHERE (wen.id=wa.id AND timestampdiff('SQL_TSI_DAY',wa.date,wen.date)>=0 AND wen.weight IS NOT NULL AND wen.date <= wa.date)
            )
        ) AS InnerWeight,
        (SELECT MAX(wen.date)
            FROM study.weight wen
            WHERE (wen.id=wa.id AND timestampdiff('SQL_TSI_DAY',wa.date,wen.date)>=0 AND wen.weight IS NOT NULL AND wa.date >= wen.date)
        ) AS RecentWeight,

        --Showing latest mlsPerKg from Water Schedules Dataset
        (SELECT wsa.mlsperKg
         FROM study.waterScheduledAnimals wsa
         WHERE wsa.id = wa.id AND wsa.date = (
             SELECT MAX(wsaDate.date)
             FROM study.waterScheduledAnimals wsaDate
             WHERE (wsaDate.id=wa.id AND wsaDate.mlsperKg IS NOT NULL AND wsaDate.date <= wa.date)
         )
        ) AS InnerMlsPerKg,
        (SELECT MAX(wsa.date)
         FROM study.waterScheduledAnimals wsa
         WHERE (wsa.id=wa.id AND wsa.mlsperKg IS NOT NULL AND wa.date >= wsa.date)
        ) AS RecentMlsPerKg

    FROM study.waterGiven wa

) voGi
WHERE voGi.InnerWeight IS NOT NULL
GROUP BY voGi.id, voGi.date,voGi.volumeGivenInLabSub,voGi.volumeGivenInCage,voGi.volumeGivenInImage,voGi.volumeGivenInProcedure,voGi.TotalWater,voGi.RecentWeight,voGi.InnerWeight,voGi.RecentMlsPerKg,voGi.InnerMlsPerKg
       
--voGi.Weight
