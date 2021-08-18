SELECT
    lsid AS lsid,
    objectid AS objectIdCoalesced,
    taskid AS taskid,
    project AS projectCoalesced,
    animalId AS animalId,
    room || '-' || cage  AS location,
    date AS date,
    dateOrdered AS dateOrdered,
    startDateCoalesced AS startDateCoalesced,
    volume AS volume,
    provideFruit AS provideFruit,
    provideFruitTitle AS provideFruitTitle,
    dataSource AS dataSource,
    assignedTo AS assignedToCoalesced,
    assignedToTitle AS assignedToTitleCoalesced,
    frequency AS frequencyCoalesced,
    frequencyMeaning AS frequencyMeaningCoalesced,
    timeofday AS timeofday,
    displaytimeofday AS displaytimeofday,
    qcstate AS qcstate,

    --(SELECT max(wg.qcstate) as label FROM study.waterGiven wg WHERE WCO.objectid = wg.treatmentid AND WCO.dateOrdered = wg.dateordered ) AS waterStatus,
   -- (SELECT timestampdiff(SQL_TSI_HOUR,WCO.date,wg.dateordered ) as diff FROM study.waterGiven wg WHERE WCO.objectid = wg.treatmentid  ) AS difference,

    (SELECT wg.weight AS weightAtDate
        FROM study.weight wg
        WHERE wg.id = WCO.animalId AND CAST(substring(CAST(wg.date AS VARCHAR) , 1, 10) AS DATE) <= WCO.date
        ORDER BY wg.date DESC
        LIMIT 1
    ) AS weightAtDate,

    (SELECT wg.date AS weightDate
        FROM study.weight wg
        WHERE wg.id = WCO.animalId AND CAST(substring(CAST(wg.date AS VARCHAR) , 1, 10) AS DATE) <= WCO.date
        ORDER BY wg.date DESC
        LIMIT 1
    ) AS weightDate

FROM study.waterScheduleCoalesced WCO
--WHERE WCO.dateRangeStartDate >= curdate()