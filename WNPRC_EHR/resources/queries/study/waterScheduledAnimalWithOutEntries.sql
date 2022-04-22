PARAMETERS(CheckDate TIMESTAMP)

SELECT DISTINCT(id), CheckDate AS date FROM
    (SELECT a.id, a.MostRecentWaterCondition, a.MostRecentWaterConditionDate FROM study.demographicsMostRecentWaterCondition a
     WHERE NOT EXISTS (
         SELECT 1 FROM study.waterTotalByDate b
                       WHERE a.id = b.id AND b.date = CheckDate AND b.TotalWater IS NOT NULL
         )
    )
WHERE MostRecentWaterCondition = 'regulated' AND MostRecentWaterConditionDate <= CheckDate