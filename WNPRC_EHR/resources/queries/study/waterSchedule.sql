/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
d.id AS animalId,
d.calculated_status,
s.*,
s.objectid as treatmentid,
--(SELECT max(d.qcstate) as label FROM study.drug d WHERE s.objectid = d.treatmentid AND s.date = d.timeordered) as treatmentStatus,
COALESCE((SELECT max(wg.qcstate) as label FROM study.waterGiven wg WHERE wg.treatmentid LIKE '%' || s.objectid || '%'  AND s.date = wg.dateordered AND wg.volume IS NOT NULL ),10) as waterStatus,
--COALESCE((SELECT max(wg.qcstate) as label FROM study.waterGiven wg WHERE s.objectid IN (wg.treatmentid)  AND s.date = wg.dateordered AND wg.volume IS NOT NULL ),10) as waterStatus,
COALESCE((SELECT max(wg.treatmentid) as treatmentIds FROM study.waterGiven wg WHERE s.date = wg.dateordered AND wg.volume IS NOT NULL ),'objectId') as watertreatment


FROM study.demographics d

JOIN (
    SELECT
        s.*,
        timestampadd('SQL_TSI_MINUTE', ((s.hours * 60) + s.minutes ), s.origDate) as date,
        CASE
            WHEN (hours >= 6 AND hours < 12) THEN 'AM'
            WHEN (hours < 20 OR hours >= 12) THEN 'PM'
            ELSE 'Other'
        END as timeOfDay,

        ((s.hours * 60) + s.minutes) as timeOffset

    FROM (

        SELECT

          t1.objectid,
          t1.taskid,
          t1.lsid,
          t1.dataset,
          t1.id as wanimalid,

          COALESCE ( ft.hourofday, ((hour(t1.date) * 100) + minute(t1.date))) as time,
          (coalesce( (ft.hourofday), (hour(t1.date) * 100)) / 100) as hours,
          CASE
            WHEN ( ft.hourofday IS NOT NULL)
            THEN (((ft.hourofday / 100.0) - floor(ft.hourofday / 100)) * 100)
            ELSE minute(t1.date)
          END as minutes,

          dr.date as origDate,
          t1.created AS created,
          t1.id.curLocation.area as area,
          t1.id.curLocation.room as room,
          t1.id.curLocation.cage as cage,
          dr.startDate AS dateRangeStartDate,
          t1.date as startDate,
          timestampdiff('SQL_TSI_DAY', cast(t1.dateOnly as timestamp), dr.dateOnly) + 1  as daysElapsed,
          t1.enddate,
          t1.enddateCoalescedFuture,    --column use to display future dates when the endDate is null
          t1.frequency AS frequency,
          t1.frequency.meaning AS freqMeaning,
          ft.timedescription AS displaytimeofday,
          t1.provideFruit AS provideFruit,
          t1.provideFruit.title AS provideFruitTitle,
          t1.assignedTo,
          t1.assignedTo.title AS assignedToTittle,
          t1.waterSource,
          t1.project,
          t1.volume,
          t1.qcstate

        FROM ehr_lookups.dateRange dr

        JOIN study.waterOrders t1
          --NOTE: should the enddate consider date/time?
          ON dr.dateOnly >= t1.dateOnly AND dr.dateOnly <= t1.enddateCoalescedFuture 

        LEFT JOIN ehr_lookups.treatment_frequency_times ft ON (ft.frequency = t1.frequency.meaning)

        INNER JOIN
            ehr_lookups.husbandry_frequency hf
            -- Frequencies that are not daily, we used the dayofweek tp populate schedule
            -- If daily it shows every day.
            ON (
                ((hf.meaning = t1.frequency.meaning)
                    AND (t1.frequency.meaning LIKE 'Daily%')
                )
            OR
                ((hf.meaning = t1.frequency.meaning)
                    AND (t1.frequency.meaning NOT LIKE 'Daily%')
                    AND (dayofweek(dr.date) = hf.dayofweek)
                )
            )


        --NOTE: if we run this report on a future interval, we want to include those treatments
        WHERE t1.date is not null --AND QCState = '1'

    ) s

) s ON (s.wanimalid = d.id)

WHERE (d.lastDayatCenter Is Null OR d.lastDayAtCenter >= s.enddateCoalescedFuture)

--Adding differet frequecies time


--account for date/time in schedule
--origDate has to have 00:00 a time otherwise it does not include the first day of the order
and s.origDate >= s.startDate and s.origDate <= s.enddateCoalescedFuture

--Filtering water regulated
--AND (s.waterSource = 'regulated' OR s.startDate = s.origDate)