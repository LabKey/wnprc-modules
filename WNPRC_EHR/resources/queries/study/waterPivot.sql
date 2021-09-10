/*SELECT
wp.id,
CAST (wp.date AS DATE) AS Date,

CAST(COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wp.id AND (dayofyear(iwg.date)-dayofyear(wp.date)) =0 AND iwg.assignedto LIKE 'laboratory'),0) AS NUMERIC) AS volumeGivenInLab,
CAST(COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wp.id AND (dayofyear(iwg.date)-dayofyear(wp.date)) =0 AND iwg.assignedto LIKE 'animalcare'),0) AS NUMERIC) AS volumeGivenInCage,

CAST((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wp.id AND (dayofyear(iwg.date)-dayofyear(wp.date)) =0) AS NUMERIC) AS Total,
CAST(((SELECT SUM (CAST (iwg.volume AS NUMERIC))
        FROM study.waterGiven iwg
        WHERE iwg.id=wp.id AND (dayofyear(iwg.date)-dayofyear(wp.date)) =0)-(20*(SELECT dm.id.MostRecentWeight.MostRecentWeight AS MostRecentWieght FROM study.demographics dm WHERE wp.id = dm.id))) AS NUMERIC) AS Weight

FROM study.waterGiven wp

GROUP BY wp.id, wp.date

PIVOT Weight,total,volumeGivenInLab, volumeGivenInCage BY id*/

SELECT wtdb.id,
       CAST(wtdb.date AS DATE) AS date,
       wtdb.weight AS Weight,
       wtdb.TotalWater AS TotalWater

FROM study.waterTotalByDate wtdb
GROUP BY wtdb.id, wtdb.date--, wtdb.Weight, wtdb.TotalWater
PIVOT wtdb.Weight,wtdb.TotalWater BY wtdb.id