-- UNION ALL faster query
-- water amount not matching time, need to add water amount according to the time set of the frequency
-- the date will match as it does with the water schedule.

(SELECT
    WA.id AS animalId,
    WA.date AS date,
    WA.date AS dateOrdered,
    WA.id.curLocation.area as area,
    WA.id.curLocation.room as room,
    WA.id.curLocation.cage as cage,
    WA.date AS startDateCoalesced,
    WA.date AS endDateCoalescedFuture,
    CAST (WA.volume AS DOUBLE) AS volume,
    WA.assignedTo AS assignedTo,
    WA.assignedTo.title AS assignedToTitle,
    WA.provideFruit AS provideFruit,
    WA.provideFruit.title AS provideFruitTitle,
    'waterAmount' AS dataSource,
    WA.objectid AS objectid,
    WA.taskid AS taskid,
    WA.lsid AS lsid,
    WA.project AS project,
    WA.frequency AS frequency,
    WA.frequency.meaning AS frequencyMeaning,
    'PM' AS timeofday,
    'PM' AS displaytimeofday,
    WA.waterSource AS waterSource,
    true AS actionRequired,
    WA.qcstate AS qcstate


FROM study.waterAmount WA
--WHERE WA.date >= curdate()
)

UNION ALL

(SELECT
    WS.animalId AS animalId,
    WS.origDate AS origDate,
    WS.date AS dateOrdered,
    WS.area as area,
    WS.room as room,
    WS.cage as cage,
    WS.startDate AS startDateCoalesced,
    WS.enddateCoalescedFuture AS endDateCoalescedFuture,
    CAST (WS.volume AS DOUBLE) AS volume,
    WS.assignedTo AS assignedTo,
    WS.assignedToTittle AS assignedToTitle,
    WS.provideFruit AS provideFruit,
    WS.provideFruitTitle AS provideFruitValue,
    'waterOrders' AS dataSource,
    WS.objectid AS objectid,
    WS.taskid AS taskid,
    WS.lsid AS lsid,
    WS.project AS project,
    WS.frequency AS frequency,
    WS.freqMeaning AS frequencyMeaning,
    WS.timeOfDay AS timeofday,
    WS.displaytimeofday AS displaytimeofday,
    WS.waterSource AS waterSource,
    (WS.waterSource = 'regulated' OR WS.startDate = WS.origDate) AS actionRequired,
    WS.waterStatus AS qcstate


FROM study.waterSchedule WS
WHERE NOT EXISTS (SELECT 1
                    FROM study.waterAmount WAI
                    WHERE WAI.id = WS.animalId AND CAST(WAI.date AS TIMESTAMP) = CAST(WS.date AS TIMESTAMP)
                      --AND WAI.frequency = WS.frequency
                    )
)