SELECT wbd.id,
       wbd.date,
       wbd.weight,
       wbd.weightDate,
       TRUNCATE(ROUND(CAST(waterSummary.TotalWater/wbd.weight AS NUMERIC),2),2) AS mlsPerKg,
       waterSummary.TotalWater,
       waterSummary.volumeGivenInLabSub,
       waterSummary.volumeGivenInCage,
       waterSummary.volumeGivenInImage,
       waterSummary.volumeGivenInProcedure,
       waterSummary.performedConcat,
       odrwc.currentWaterCondition,
       waterSummary.project,
       waterSummary.qcstate

FROM ehr_lookups.calendar cal
 LEFT OUTER JOIN (SELECT drwc.Id AS Id,
                 MIN(drwc.date) AS firstDate,
                 (SELECT wsainner.condition
                  FROM study.waterScheduledAnimals wsainner
                  WHERE drwc.id = wsainner.id
                  ORDER BY wsainner.date DESC LIMIT 1) AS currentWaterCondition

        FROM study.waterScheduledAnimals drwc
        GROUP BY Id) odrwc
        ON cal.targetdate >= CAST (odrwc.firstDate AS DATE) AND cal.targetdate <= curdate()
LEFT OUTER JOIN(
    SELECT Id AS innerId,
    CAST(iwg.date as DATE) as date,
    COALESCE (SUM(CASE WHEN iwg.location = 'lab' THEN iwg.volume ELSE 0 END),0) AS volumeGivenInLabSub,
    COALESCE (SUM(CASE WHEN iwg.location = 'animalRoom' THEN iwg.volume ELSE 0 END),0) AS volumeGivenInCage,
    COALESCE (SUM(CASE WHEN iwg.location = 'imaging' THEN iwg.volume ELSE 0 END), 0) AS volumeGivenInImage,
    COALESCE (SUM(CASE WHEN iwg.location = 'procedureRoom' THEN iwg.volume ELSE 0 END), 0) AS volumeGivenInProcedure,
    COALESCE(SUM(iwg.volume), 0) AS TotalWater,
    COALESCE(GROUP_CONCAT(iwg.performedby, ';'),'') AS performedConcat,
    MAX(iwg.project) AS project,
    COALESCE(MAX(iwg.qcstate),1) AS qcstate
    FROM study.waterGiven iwg WHERE qcstate.label = 'Completed'
    GROUP BY iwg.Id, CAST(iwg.date AS DATE)
    )waterSummary
ON wbd.id = waterSummary.id AND CAST(wbd.date AS DATE) = waterSummary.date