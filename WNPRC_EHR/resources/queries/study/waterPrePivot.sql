SELECT DISTINCT
voGi.id as animalId,
CAST (voGi.date AS DATE) AS date,
--voGi.projectConcat AS projectConcat,
voGi.performedConcat AS performedConcat,
CAST (voGi.qcstateConcat AS INTEGER) AS qcstate,

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

voGi.RecentMlsPerKg,
voGi.InnerMlsPerKg,

'waterGiven' AS dataSource

FROM (

    SELECT
        wa.id AS id,
        wa.date AS date,
        --GROUP_CONCAT(DISTINCT wa.project, ';') AS projectConcat,
        COALESCE((SELECT GROUP_CONCAT(iwg.performedby, ';') FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) = 0),' ') AS performedConcat,
        COALESCE((SELECT DISTINCT( iwg.qcstate)  FROM study.waterGiven iwg WHERE iwg.id=wa.id AND iwg.qcstate.label = 'Completed' AND (dayofyear(iwg.date)-dayofyear(wa.date)) = 0),'22') AS qcstateConcat,
        COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) = 0 AND iwg.location LIKE 'lab'),0) AS volumeGivenInLabSub,
        COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) = 0 AND iwg.location LIKE 'animalRoom'),0) AS volumeGivenInCage,
        COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) = 0 AND iwg.location LIKE 'imaging'),0) AS volumeGivenInImage,
        COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) = 0 AND iwg.location LIKE 'procedureRoom'),0) AS volumeGivenInProcedure,
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
    WHERE wa.qcstate.label = 'Completed'
    GROUP BY wa.id, wa.date

) voGi
WHERE voGi.InnerWeight IS NOT NULL
--GROUP BY voGi.id,voGi.date,voGi.projectConcat,voGi.performedConcat,voGi.qcstateConcat,voGi.volumeGivenInLabSub,voGi.volumeGivenInCage,voGi.volumeGivenInImage,voGi.volumeGivenInProcedure,voGi.TotalWater,voGi.RecentWeight,voGi.InnerWeight,voGi.RecentMlsPerKg,voGi.InnerMlsPerKg
GROUP BY voGi.id,voGi.date,voGi.performedConcat,voGi.qcstateConcat,voGi.volumeGivenInLabSub,voGi.volumeGivenInCage,voGi.volumeGivenInImage,voGi.volumeGivenInProcedure,voGi.TotalWater,voGi.RecentWeight,voGi.InnerWeight,voGi.RecentMlsPerKg,voGi.InnerMlsPerKg
--voGi.Weight
