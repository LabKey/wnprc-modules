PARAMETERS(CheckDate TIMESTAMP)

SELECT
    DISTINCT(id),
    Id.death.date AS deathDate,
    CheckDate AS date,
    project AS project,
    location as location
FROM
    (SELECT
        a.id,
        a.MostRecentWaterCondition,
        a.MostRecentWaterConditionDate,
        a.project,
        a.location
    FROM study.demographicsMostRecentWaterCondition a
     WHERE NOT EXISTS (
         SELECT 1 FROM study.waterTotalByDate b
                       WHERE a.id = b.id AND b.date = CheckDate AND b.TotalWater IS NOT NULL
         )
    )
WHERE MostRecentWaterCondition = 'regulated' AND MostRecentWaterConditionDate <= CheckDate
AND (Id.death.date IS NULL OR CheckDate <= Id.death.date )
ORDER BY project