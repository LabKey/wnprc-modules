SELECT wa.id,

CAST (wa.date AS DATE) as date,
COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.water_given iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0 AND iwg.assignto LIKE 'laboratory'),0) AS volumeGivenInLab,
COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.water_given iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0 AND iwg.assignto LIKE 'animalcare'),0) AS volumeGivenInCage,
COALESCE ((SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.water_given iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0),0) AS TotalvolumeGiven,

wa.volume AS Goalvolume,
COALESCE (wa.volume - (SELECT SUM (CAST (iwg.volume AS NUMERIC)) FROM study.water_given iwg WHERE iwg.id=wa.id AND (dayofyear(iwg.date)-dayofyear(wa.date)) =0), wa.volume) AS WaterRemaining,

FROM study.water_amount wa

GROUP BY wa.id, wa.date, wa.volume