-- This query extends the DiarrheaObs report by including cage observations for diarrhea,
-- with specific conditions for single-housed and group-housed animals.

-- CTE for current number of roommates for each animal
WITH CurrentRoommates AS (
    SELECT
        h.id,
        COUNT(h2.id) AS NumRoommates
    FROM study.housing h
    LEFT JOIN study.housing h2 ON h.room = h2.room AND h.cage = h2.cage AND h.id != h2.id AND h.enddate IS NULL AND h2.enddate IS NULL
    WHERE h.enddate IS NULL
    GROUP BY h.id
),

-- CTE for diarrhea-related treatments
DiarrheaTreatments AS (
    SELECT
        t.Id,
        t.date
    FROM study.treatment_order t
    WHERE
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
),

-- Combined and filtered observations
CombinedObs AS (
    -- Observations from obs table
    SELECT
        obs.Id,
        obs.dateOnly AS obs_date,
        obs.feces,
        1 AS priority
    FROM study."Irregular Obs No Okays" obs
    WHERE obs.feces IS NOT NULL

    UNION ALL

    -- Filtered cage observations
    SELECT
        co.Id,
        co.date AS obs_date,
        co.feces,
        2 AS priority
    FROM study.cageObs co
    LEFT JOIN CurrentRoommates cr ON co.Id = cr.id
    LEFT JOIN DiarrheaTreatments dt ON co.Id = dt.Id AND co.date = dt.date
    WHERE
        co.feces IS NOT NULL AND
        (
            -- Single-housed animals
            cr.NumRoommates = 0 OR
            -- Group-housed animals with a diarrhea-related treatment
            (cr.NumRoommates > 0 AND dt.Id IS NOT NULL)
        )
),

-- Final selection with deduplication, prioritizing 'obs' over 'cageObs'
FinalObs as ( SELECT
    t1.Id,
    t1.obs_date AS dateOnly,
    t1.feces
FROM CombinedObs t1
INNER JOIN (
    SELECT
        Id,
        obs_date,
        MIN(priority) AS min_priority
    FROM CombinedObs
    GROUP BY Id, obs_date
) t2 ON t1.Id = t2.Id AND t1.obs_date = t2.obs_date AND t1.priority = t2.min_priority)
