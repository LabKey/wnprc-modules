SELECT
    lsid AS lsid,
    objectid AS objectIdCoalesced,
    taskid AS taskid,
    project AS projectCoalesced,
    animalId AS animalId,
    date AS date,
    dateCreated AS dateCreated,
    dateRangeStartDate AS dateRangeStartDate,
    volume AS volume,
    dataSource AS dataSource,
    assignedTo AS assignedToCoalesced,
    assignedToTitle AS assignedToTitleCoalesced,
    frequency AS frequencyCoalesced,
    frequencyMeaning AS frequencyMeaningCoalesced,

    (SELECT max(wg.qcstate) as label FROM study.waterGiven wg WHERE WCO.objectid = wg.treatmentid AND WCO.date = wg.dateordered ) AS waterStatus,
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