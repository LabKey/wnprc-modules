SELECT wbd.id,
       wbd.date,
       wbd.weight,
       TRUNCATE(ROUND(CAST(waterSummary.TotalWater/wbd.weight AS NUMERIC),2),2) AS mlsPerKg,
       waterSummary.volumeGivenInLabSub,
       waterSummary.volumeGivenInCage,
       waterSummary.volumeGivenInImage,
       waterSummary.volumeGivenInProcedure,
       waterSummary.TotalWater,
       waterSummary.performedConcat,
       waterSummary.qcstate

FROM study.weightByDate wbd
LEFT OUTER JOIN(
    SELECT Id,
    CAST(iwg.date as DATE) as date,
    COALESCE (SUM(CASE WHEN iwg.location = 'lab' THEN iwg.volume ELSE 0 END),0) AS volumeGivenInLabSub,
    COALESCE (SUM(CASE WHEN iwg.location = 'animalRoom' THEN iwg.volume ELSE 0 END),0) AS volumeGivenInCage,
    COALESCE (SUM(CASE WHEN iwg.location = 'imaging' THEN iwg.volume ELSE 0 END), 0) AS volumeGivenInImage,
    COALESCE (SUM(CASE WHEN iwg.location = 'procedureRoom' THEN iwg.volume ELSE 0 END), 0) AS volumeGivenInProcedure,
    COALESCE(SUM(iwg.volume), 0) AS TotalWater,
    COALESCE(GROUP_CONCAT(iwg.performedby, ';'),'') AS performedConcat,
    COALESCE(MAX(iwg.qcstate),1) AS qcstate
    FROM study.waterGiven iwg WHERE qcstate.label = 'Completed'
    GROUP BY Id, CAST(iwg.date AS DATE)
    )waterSummary
ON wbd.id = waterSummary.id AND CAST(wbd.date AS DATE) = waterSummary.date