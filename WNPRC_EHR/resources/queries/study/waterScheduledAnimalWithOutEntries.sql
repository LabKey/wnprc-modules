PARAMETERS(CheckDate TIMESTAMP);

SELECT DISTINCT(id), CheckDate AS date FROM
    (SELECT a.id, a.MostRecentWaterCondition FROM study.demographicsMostRecentWaterCondition a
     WHERE NOT EXISTS (
         SELECT 1 FROM study.waterPrePivot b
                       WHERE a.id = b.animalId AND b.date = CheckDate
         )
    )
WHERE MostRecentWaterCondition = 'regulated'