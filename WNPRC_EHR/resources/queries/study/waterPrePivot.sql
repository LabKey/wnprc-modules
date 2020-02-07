SELECT DISTINCT
voGi.id as animalId,
CAST (voGi.date AS DATE) AS Date,

--max(wa.volume) AS goal,
--COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.water_given iwg WHERE iwg.id=voGi.id AND (dayofyear(iwg.date)-dayofyear(voGi.date)) =0 AND iwg.assignto LIKE 'laboratory'),0) AS volumeGivenInLab,
voGi.volumeGivenInLabSub,
voGi.volumeGivenInCage,

voGi.TotalWater AS TotalWater,
voGi.TotalWater AS volume,
voGi.RecentWeight,
voGi.InnerWeight,
TRUNCATE(ROUND(CAST(voGi.TotalWater /voGi.InnerWeight AS NUMERIC),2),2) AS mlsPerKg,
voGi.InnerWeight*20 - voGi.TotalWater AS WaterReamining,
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
    COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0 AND iwg.assignedto LIKE 'laboratory'),0) AS volumeGivenInLabSub,
    COALESCE ((SELECT SUM(CAST(iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0 AND iwg.assignedto LIKE 'animalcare'),0) AS volumeGivenInCage,
    COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0),0) AS TotalWater,
    (SELECT we.weight
        FROM study.weight we
        --INNER JOIN study.weight wein
        --ON we.id = wein.id
        WHERE we.id = wa.id AND we.date = (SELECT MAX(wen.date) from study.weight wen WHERE wen.id=wa.id AND timestampdiff('SQL_TSI_DAY',wen.date ,wa.date)>=0))AS InnerWeight,
    (SELECT MAX(wen.date) from study.weight wen WHERE wen.id=wa.id AND timestampdiff('SQL_TSI_DAY',wen.date ,wa.date)>=0) AS RecentWeight
    --timestampdiff('SQL_TSI_DAY',wa.date ,we.date)>=0) AS Innerweight

    FROM study.waterGiven wa
    /*SELECT  iwg.id,
            iwg.date,
            SUM (CAST (iwg.volume AS NUMERIC)) AS volumeGivenInLabSub
    FROM study.water_given iwg
    WHERE (iwg.id=iwg.id AND (dayofyear(iwg.date)-dayofyear(iwg.date)) =0 AND iwg.assignto LIKE 'laboratory')
    GROUP BY iwg.id,iwg.date
    --,iwg.Weight
    --,iwg.volumeGivenInLabSub*/

) voGi
GROUP BY voGi.id, voGi.date,voGi.volumeGivenInLabSub,voGi.TotalWater,voGi.volumeGivenInCage,voGi.RecentWeight,voGi.InnerWeight
--voGi.Weight
