-- CTE to define the start date, which is 5 years ago from the current date.
WITH FiveYearsAgo AS (
    SELECT TIMESTAMPADD('SQL_TSI_YEAR', -5, NOW()) AS StartDate
),

-- CTE to identify animals that are of rhesus species and have shown potential for diarrhea in the last 5 years.
-- Potential for diarrhea is determined by specific observations, treatments, or housing conditions.
PotentialDiarrheaAnimals AS (
    SELECT DISTINCT sd.Id, d.gender
    FROM study.StudyData sd
    LEFT JOIN study.demographics d ON sd.Id = d.Id
    LEFT JOIN (
        -- Subquery to determine the number of roommates for each animal.
        SELECT
            h.id,
            COUNT(h2.id) AS NumRoommates
        FROM study.housing h
        LEFT JOIN study.housing h2 ON h.room = h2.room AND h.cage = h2.cage AND h.id != h2.id AND h.enddate IS NULL AND h2.enddate IS NULL
        WHERE h.enddate IS NULL
        GROUP BY h.id
    ) AS housing_info ON sd.Id = housing_info.id
    WHERE
        d.species = 'Rhesus'
        AND sd.date >= (SELECT StartDate FROM FiveYearsAgo)
        AND (
            -- Condition 1: Single-housed animal with a cage observation of diarrhea.
            (housing_info.NumRoommates = 0 AND sd.DataSet.Name = 'cageObs' AND sd.description LIKE '%Feces%') OR
            -- Condition 2: Group-housed animal with a cage observation of diarrhea and a specific treatment.
            (housing_info.NumRoommates > 0 AND sd.DataSet.Name = 'cageObs' AND sd.description LIKE '%Feces%' AND EXISTS (
                SELECT 1
                FROM study.treatment_order t
                WHERE t.Id = sd.Id AND t.date = sd.date AND (
                    -- List of treatments indicating diarrhea.
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
            )) OR
            -- Condition 3: Irregular observation of diarrhea.
            (sd.DataSet.Name = 'obs' AND sd.description LIKE '%Feces%') OR
            -- Condition 4: Encounter report of diarrhea.
            (sd.DataSet.Name = 'encounters' AND LOWER(sd.remark) LIKE '%diarrhea%')
        )
),

-- CTE to generate a series of dates for the last 5 years.
DateSeries AS (
    SELECT
        CAST(TIMESTAMPADD('SQL_TSI_DAY', num_series.n, dr.StartDate) AS DATE) AS date
    FROM
        -- 1. Replace this section with your actual source table or parameterized dates
        (
            SELECT
                CAST('2021-01-01' AS TIMESTAMP) AS StartDate,
                CAST('2026-01-01' AS TIMESTAMP) AS EndDate
        ) dr

            JOIN
        -- 2. Generate a sequential list of numbers (0-999) using a cross join
            (
                SELECT (ones.v + tens.v * 10 + hundreds.v * 100 + thousands.v * 1000) AS n
                FROM
                    (SELECT 0 AS v UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) ones
                        CROSS JOIN
                    (SELECT 0 AS v UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) tens
                        CROSS JOIN
                    (SELECT 0 AS v UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) hundreds
                        CROSS JOIN
                    -- Added this block to increase maximum range from 999 to 9999
                        (SELECT 0 AS v UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) thousands
            ) num_series
        -- 3. Only keep dates that fall within your defined range
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
                WHEN feces = 'SF' THEN 1
                WHEN feces = 'SF,D' OR feces = 'D,SF' THEN 2
                WHEN feces = 'SF,WD' OR feces = 'WD,SF' THEN 3
                WHEN feces = 'D' THEN 4
                WHEN feces = 'D,WD' OR feces = 'WD,D' THEN 5
                WHEN feces = 'WD' THEN 6
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
    COALESCE(dds.diarrhea_status, 0) AS diarrhea_status
FROM PotentialDiarrheaAnimals pda
CROSS JOIN DateSeries ds
LEFT JOIN DailyHousingChanges dhc ON pda.Id = dhc.Id AND ds.date = dhc.date
LEFT JOIN DailyTreatments dt ON pda.Id = dt.Id AND ds.date = dt.date
LEFT JOIN DailyDiarrheaStatus dds ON pda.Id = dds.Id AND ds.date = dds.dateOnly
ORDER BY pda.Id, ds.date;
