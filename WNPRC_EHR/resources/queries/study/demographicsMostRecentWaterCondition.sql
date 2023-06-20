SELECT

wsa.id,
wsa.MostRecentWaterConditionDate,
wsa.room || '-' || wsa.cage as location,
(
    SELECT wsainner.project
    FROM study.waterScheduledAnimals wsainner
    WHERE wsa.id = wsainner.id AND wsa.MostRecentWaterConditionDate = wsainner.date

)  AS project,
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
        max(wsaouter.date) AS MostRecentWaterConditionDate,
        max(wsaouter.id.dataset.activehousing.room) AS room,
        max(wsaouter.id.dataset.activehousing.cage) AS cage,

    FROM study.waterScheduledAnimals wsaouter
    WHERE wsaouter.qcstate.publicdata = true AND wsaouter.condition IS NOT NULL
    GROUP BY wsaouter.id
        ) wsa
