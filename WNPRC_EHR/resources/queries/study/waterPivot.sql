SELECT
--wa.id, wa.Date, wa.amountGivenInLab, wa.amountGivenInCage, wa.total, wa.weight
wp.id,
CAST (wp.date AS DATE) AS Date,

--max(wa.amount) AS goal,
CAST(COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wp.id AND (dayofyear(iwg.date)-dayofyear(wp.date)) =0 AND iwg.assignedto LIKE 'laboratory'),0) AS NUMERIC) AS volumeGivenInLab,
CAST(COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wp.id AND (dayofyear(iwg.date)-dayofyear(wp.date)) =0 AND iwg.assignedto LIKE 'animalcare'),0) AS NUMERIC) AS volumeGivenInCage,

CAST((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.waterGiven iwg WHERE iwg.id=wp.id AND (dayofyear(iwg.date)-dayofyear(wp.date)) =0) AS NUMERIC) AS Total,
CAST(((SELECT SUM (CAST (iwg.volume AS NUMERIC))
        FROM study.waterGiven iwg
        WHERE iwg.id=wp.id AND (dayofyear(iwg.date)-dayofyear(wp.date)) =0)-(20*(SELECT dm.id.MostRecentWeight.MostRecentWeight AS MostRecentWieght FROM study.demographics dm WHERE wp.id = dm.id))) AS NUMERIC) AS Weight
--sum(wp.Weight) AS Weight

FROM study.waterGiven wp

--WHERE wp.Date > '2015-02-13' and  wp.id='r02086'

GROUP BY wp.id, wp.date
--GROUP BY wa.id, wa.date, wa.volumeGivenInLab, wa.volumeGivenInCage, wa.total, wa.weight

--PIVOT goal BY id
PIVOT Weight,total,volumeGivenInLab, volumeGivenInCage BY id
--PIVOT weight,total BY id