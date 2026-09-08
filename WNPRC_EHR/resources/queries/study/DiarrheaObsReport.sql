-- CTE to define the start date, which is 5 years ago from the current date.
WITH FiveYearsAgo AS (
    SELECT TIMESTAMPADD('SQL_TSI_YEAR', -5, NOW()) AS StartDate
),

-- CTE for animals with diarrhea-related treatments in the last 5 years (Condition 2.5 and for Condition 2 matching)
DiarrheaTreatmentAnimals AS (
    SELECT DISTINCT
        t.Id,
        CAST(t.date AS DATE) AS dateOnly
    FROM study.treatment_order t
    WHERE t.date >= (SELECT StartDate FROM FiveYearsAgo)
      AND (
          t.description LIKE '%w-10980%' OR t.description LIKE '%c-54620%' OR t.description LIKE '%w-10942%' OR
          t.description LIKE '%w-10944%' OR t.description LIKE '%c-54630%' OR t.description LIKE '%c-52a68%' OR
          t.description LIKE '%w-10044%' OR t.description LIKE '%c-52a20%' OR t.description LIKE '%c-93040%' OR
          t.description LIKE '%c-a0111%' OR t.description LIKE '%c-52a10%' OR t.description LIKE '%w-10226%' OR
          t.description LIKE '%f-61c7b%' OR t.description LIKE '%c-55020%' OR t.description LIKE '%c-d1507%' OR
          t.description LIKE '%c-52a00%' OR t.description LIKE '%t-59666%' OR t.description LIKE '%c-d4657%' OR
          t.description LIKE '%r-f94e9%' OR t.description LIKE '%c-b0158%' OR t.description LIKE '%w-10587%' OR
          t.description LIKE '%w-10757%' OR t.description LIKE '%r-f94e9%' OR t.description LIKE '%c-d3739%' OR
          t.description LIKE '%w-10222%' OR t.description LIKE '%c-84540%' OR t.description LIKE '%w-10975%' OR
          t.description LIKE '%c-52040%' OR t.description LIKE '%c-5205d%' OR t.description LIKE '%c-84232%' OR
          t.description LIKE '%c-56101%' OR t.description LIKE '%c-84560%' OR t.description LIKE '%c-56a50%' OR
          t.description LIKE '%@e-85350%' OR t.description LIKE '%c-a01b0%' OR t.description LIKE '%f-61e1f%' OR
          t.description LIKE '%c-84812%' OR t.description LIKE '%w-10908%' OR t.description LIKE '%w-10882%' OR
          t.description LIKE '%c-0026e%' OR t.description LIKE '%c-55001%' OR t.description LIKE '%c-52340%'
      )
),

-- CTE to determine the current number of roommates for each animal
HousingRoommates AS (
    SELECT
        h.id,
        COUNT(h2.id) AS NumRoommates
    FROM study.housing h
    LEFT JOIN study.housing h2 ON h.room = h2.room AND h.cage = h2.cage AND h.id != h2.id AND h.enddate IS NULL AND h2.enddate IS NULL
    WHERE h.enddate IS NULL
    GROUP BY h.id
),

-- CTE to filter cage observations with diarrhea in the last 5 years
DiarrheaCageObs AS (
    SELECT
        co.room,
        co.cage,
        co.date,
        CAST(co.date AS DATE) AS dateOnly
    FROM ehr.cage_observations co
    WHERE co.date >= (SELECT StartDate FROM FiveYearsAgo)
      AND co.feces IS NOT NULL
      AND (co.feces LIKE '%D%' OR co.feces LIKE '%SF%' OR co.feces LIKE '%WD%')
),

-- CTE to identify animals matching Condition 1 (single-housed) or Condition 2 (group-housed with treatment)
CageObsAnimals AS (
    SELECT DISTINCT
        h.id AS Id
    FROM DiarrheaCageObs dco
    JOIN study.housing h ON h.room = dco.room AND h.cage = dco.cage AND h.date <= dco.date AND (h.enddate >= dco.date OR h.enddate IS NULL)
    LEFT JOIN HousingRoommates hr ON h.id = hr.id
    LEFT JOIN DiarrheaTreatmentAnimals dta ON h.id = dta.Id AND dco.dateOnly = dta.dateOnly
    WHERE (hr.NumRoommates = 0) OR (hr.NumRoommates > 0 AND dta.Id IS NOT NULL)
),

-- CTE combining all potential diarrhea animal IDs across all conditions
AllDiarrheaAnimals AS (
    -- Condition 1 & 2: Cage observations
    SELECT Id, 1 AS is_cage_obs FROM CageObsAnimals
    UNION ALL
    -- Condition 2.5: Treatments
    SELECT DISTINCT Id, 0 AS is_cage_obs FROM DiarrheaTreatmentAnimals
    UNION ALL
    -- Condition 3: Irregular observations
    SELECT DISTINCT obs.Id, 0 AS is_cage_obs
    FROM study.obs obs
    WHERE obs.date >= (SELECT StartDate FROM FiveYearsAgo)
      AND obs.feces IS NOT NULL
      AND (obs.feces LIKE '%D%' OR obs.feces LIKE '%SF%' OR obs.feces LIKE '%WD%')
    UNION ALL
    -- Condition 4: Encounters
    SELECT DISTINCT enc.Id, 0 AS is_cage_obs
    FROM study.encounters enc
    WHERE enc.date >= (SELECT StartDate FROM FiveYearsAgo)
      AND LOWER(enc.remark) LIKE '%diarrhea%'
),

-- CTE to identify animals that are of rhesus species and have shown potential for diarrhea in the last 5 years.
PotentialDiarrheaAnimals AS (
    SELECT
        d.Id,
        d.gender,
        d.birth,
        d.death,
        MAX(a.is_cage_obs) AS is_cage_obs
    FROM AllDiarrheaAnimals a
    JOIN study.demographics d ON a.Id = d.Id
    WHERE d.species = 'Rhesus'
    GROUP BY d.Id, d.gender, d.birth, d.death
),

-- CTE to generate a series of dates for the last 5 years.
DateSeries AS (
    SELECT
        CAST(TIMESTAMPADD('SQL_TSI_DAY', num_series.n, dr.StartDate) AS DATE) AS date
    FROM
        (
            SELECT
                (SELECT StartDate FROM FiveYearsAgo) AS StartDate,
                NOW() AS EndDate
        ) dr

            JOIN
            (
                SELECT (ones.v + tens.v * 10 + hundreds.v * 100 + thousands.v * 1000) AS n
                FROM
                    (SELECT 0 AS v UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) ones
                        CROSS JOIN
                    (SELECT 0 AS v UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) tens
                        CROSS JOIN
                    (SELECT 0 AS v UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) hundreds
                        CROSS JOIN
                    (SELECT 0 AS v UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) thousands
            ) num_series
        ON
            TIMESTAMPADD('SQL_TSI_DAY', num_series.n, dr.StartDate) <= dr.EndDate
),

-- CTE to count the number of housing changes for each animal on each day.
DailyHousingChanges AS (
    SELECT
        Id,
        CAST(date AS DATE) AS date,
        COUNT(*) AS housing_changes
    FROM study.housing
    WHERE Id IN (SELECT Id FROM PotentialDiarrheaAnimals)
    GROUP BY Id, CAST(date AS DATE)
),

-- CTE to count the number of treatments for each animal on each day.
DailyTreatments AS (
    SELECT
        Id,
        CAST(date AS DATE) AS date,
        COUNT(*) AS treatments
    FROM study.treatment_order
    WHERE Id IN (SELECT Id FROM PotentialDiarrheaAnimals)
    GROUP BY Id, CAST(date AS DATE)
),

-- CTE to calculate a diarrhea score for each animal on each day based on observations.
DailyDiarrheaStatus AS (
    SELECT
        Id,
        CAST(dateOnly AS DATE) AS dateOnly,
        MAX(
            CASE
                -- D + WD = 5
                WHEN (',' || feces || ',') LIKE '%,D,%' AND (',' || feces || ',') LIKE '%,WD,%' THEN 5
                -- SF + WD = 3
                WHEN (',' || feces || ',') LIKE '%,SF,%' AND (',' || feces || ',') LIKE '%,WD,%' THEN 3
                -- SF + D = 2
                WHEN (',' || feces || ',') LIKE '%,SF,%' AND (',' || feces || ',') LIKE '%,D,%' THEN 2
                -- WD = 6
                WHEN (',' || feces || ',') LIKE '%,WD,%' THEN 6
                -- D = 4
                WHEN (',' || feces || ',') LIKE '%,D,%' THEN 4
                -- SF = 1
                WHEN (',' || feces || ',') LIKE '%,SF,%' THEN 1
                ELSE 0
            END
        ) AS diarrhea_status
    FROM study.DiarrheaObs
    WHERE Id IN (SELECT Id FROM PotentialDiarrheaAnimals)
    GROUP BY Id, CAST(dateOnly AS DATE)
)

-- Final SELECT statement to assemble the daily report for each animal.
SELECT
    pda.Id,
    pda.gender,
    ds.date,
    COALESCE(dhc.housing_changes, 0) AS housing_changes,
    COALESCE(dt.treatments, 0) AS treatments,
    COALESCE(dds.diarrhea_status, 0) AS diarrhea_status,
    pda.is_cage_obs AS "Cage Obs"
FROM PotentialDiarrheaAnimals pda
CROSS JOIN DateSeries ds
LEFT JOIN DailyHousingChanges dhc ON pda.Id = dhc.Id AND ds.date = dhc.date
LEFT JOIN DailyTreatments dt ON pda.Id = dt.Id AND ds.date = dt.date
LEFT JOIN DailyDiarrheaStatus dds ON pda.Id = dds.Id AND ds.date = dds.dateOnly
WHERE ds.date >= CAST(pda.birth AS DATE) AND (ds.date <= CAST(pda.death AS DATE) OR pda.death IS NULL)
ORDER BY pda.Id, ds.date;