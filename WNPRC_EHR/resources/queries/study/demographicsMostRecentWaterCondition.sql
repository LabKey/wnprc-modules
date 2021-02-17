SELECT

wsa.id,
wsa.MostRecentWaterConditionDate,
(
      SELECT wsainner.mlsperKg
      FROM study.waterScheduledAnimals wsainner
      WHERE wsa.id = wsainner.id AND wsa.MostRecentWaterConditionDate = wsainner.date

)  AS mlsperKg,
(
     SELECT wsainner.condition
     FROM study.waterScheduledAnimals wsainner
     WHERE wsa.id = wsainner.id AND wsa.MostRecentWaterConditionDate = wsainner.date

) AS MostRecentWaterCondition
FROM(
    SELECT
        wsaouter.id as id,
        max(wsaouter.date) AS MostRecentWaterConditionDate
    FROM study.waterScheduledAnimals wsaouter
    WHERE wsaouter.qcstate.publicdata = true AND wsaouter.condition IS NOT NULL
    GROUP BY wsaouter.id
        ) wsa
