-- UNION ALL faster query

(SELECT
    WA.id AS animalId,
    WA.date AS date,
    WA.created AS dateCreated,
    WA.id.curLocation.area as area,
    WA.id.curLocation.room as room,
    curdate() AS dateRangeStartDate,
    CAST (WA.volume AS DOUBLE) AS volume,
    WA.assignedTo AS assignedTo,
    WA.assignedTo.title AS assignedToTitle,
    'waterAmount' AS dataSource,
    WA.objectid AS objectid,
    WA.taskid AS taskid,
    WA.lsid AS lsid,
    WA.project AS project,
    WA.frequency AS frequency,
    WA.frequency.meaning AS frequencyMeaning


FROM study.waterAmount WA
WHERE WA.date >= curdate()
)

UNION ALL

(SELECT
    WS.animalId AS animalId,
    WS.origDate AS date,
    WS.created AS dateCreated,
    WS.area as area,
    WS.room as room,
    WS.dateRangeStartDate AS dateRangeStartDate,
    CAST (WS.volume AS DOUBLE) AS volume,
    WS.assignedTo AS assignedTo,
    WS.assignedToTittle AS assignedToTitle,
    'waterOrders' AS dataSource,
    WS.objectid AS objectid,
    WS.taskid AS taskid,
    WS.lsid AS lsid,
    WS.project AS project,
    WS.frequency AS frequency,
    WS.freqMeaning AS frequencyMeaning


FROM study.waterSchedule WS
WHERE NOT EXISTS (SELECT 1
                    FROM study.waterAmount WAI
                    WHERE WAI.id = WS.animalId AND WAI.date = WS.origDate
                    )


)


