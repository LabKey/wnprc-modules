/*Creates a date entry for every day for each animal in the water monitoring system.
  It uses LabKeys ehr_lookup.calendar to create and ongoing date row from the
  first date the animal gets added to the system. It adds all the water the animal receives
  for every single day in the system. If no water is given to the animal is creates an
  empty row.*/

SELECT
       Id,
       cal.targetdate AS date,
       waterSummary.TotalWater,
       waterSummary.provideFruit,
       waterSummary.remark,
       waterSummary.volumeGivenInLabSub,
       waterSummary.volumeGivenInCage,
       waterSummary.volumeGivenInImage,
       waterSummary.volumeGivenInProcedure,
       waterSummary.performedConcat,
       odrwc.currentWaterCondition,
       waterSummary.project,
       waterSummary.qcstate,
       waterSummary.curRoom,
       waterSummary.curCage

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
    COALESCE(GROUP_CONCAT(iwg.provideFruit.title,'; '),'') AS provideFruit,
    COALESCE(GROUP_CONCAT(iwg.remarks,'; '),'') AS remark,
    COALESCE(GROUP_CONCAT(iwg.performedby, ';'),'') AS performedConcat,
    MAX(iwg.project) AS project,
    COALESCE(MAX(iwg.qcstate),1) AS qcstate,
    MAX(iwg.id.curLocation.room) as curRoom,
    MAX(iwg.id.curLocation.cage) as curCage,
    FROM study.waterGiven iwg WHERE qcstate.label = 'Completed'
    GROUP BY iwg.Id, CAST(iwg.date AS DATE)
    )waterSummary
ON CAST(cal.targetdate AS DATE) = waterSummary.date AND waterSummary.innerId = Id
WHERE cal.targetdate <= curdate() AND Id IS NOT NULL