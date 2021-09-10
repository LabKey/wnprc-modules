/*SELECT ewbd.id,
       ewbd.date,
       ewbd.weight,
       TRUNCATE(ROUND(CAST(ewbd.TotalWater/ewbd.weight AS NUMERIC),2),2) AS mlsPerKg,
       ewbd.volumeGivenInLabSub,
       ewbd.volumeGivenInCage,
       ewbd.volumeGivenInImage,
       ewbd.volumeGivenInProcedure,
       ewbd.TotalWater,
       ewbd.performedConcat,
       CAST(ewbd.qcstateConcat AS INTEGER) AS qcstate

FROM(
    SELECT wbd.id,
       wbd.date,
       wbd.weight,
       COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wbd.id AND (dayofyear(iwg.date)-dayofyear(wbd.date)) = 0 AND iwg.location LIKE 'lab'),0) AS volumeGivenInLabSub,
       COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wbd.id AND (dayofyear(iwg.date)-dayofyear(wbd.date)) = 0 AND iwg.location LIKE 'animalRoom'),0) AS volumeGivenInCage,
       COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wbd.id AND (dayofyear(iwg.date)-dayofyear(wbd.date)) = 0 AND iwg.location LIKE 'imaging'),0) AS volumeGivenInImage,
       COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wbd.id AND (dayofyear(iwg.date)-dayofyear(wbd.date)) = 0 AND iwg.location LIKE 'procedureRoom'),0) AS volumeGivenInProcedure,
       COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wbd.id AND (dayofyear(iwg.date)-dayofyear(wbd.date)) =0),0) AS TotalWater,
       COALESCE((SELECT GROUP_CONCAT(iwg.performedby, ';') FROM study.waterGiven iwg WHERE iwg.id=wbd.id AND (dayofyear(iwg.date)-dayofyear(wbd.date)) = 0),' ') AS performedConcat,
       COALESCE((SELECT DISTINCT( iwg.qcstate)  FROM study.waterGiven iwg WHERE iwg.id=wbd.id AND iwg.qcstate.label = 'Completed' AND (dayofyear(iwg.date)-dayofyear(wbd.date)) = 0),'22') AS qcstateConcat
    FROM study.weightByDate wbd
    ) ewbd*/

SELECT wbd.id,
       wbd.date,
       wbd.weight

FROM study.weightByDate wbd
LEFT OUTER JOIN(
    SELECT Id,
    CAST(iwg.date as DATE) as date,
    COALESCE (SUM(CASE WHEN iwg.location = 'lab' THEN iwg.volume ELSE 0 END),0) AS volumeGivenInLabSub,
    COALESCE (SUM(CASE WHEN iwg.location = 'animalRoom' THEN iwg.volume ELSE 0 END),0) AS volumeGivenInCage
    FROM study.waterGiven iwg
    GROUP BY Id, CAST(iwg.date AS DATE)
    )waterSummary
ON wbd.id = waterSummary.id AND CAST(wbd.date AS DATE) = waterSummary.date