/*
 * Below query is based on WNPRC's current financial system - a query that resides in perdiems.pl:
 * select a.Id as id, project.account as account, h.area as location,
 *               case
 *                       when CAST(a.date as DATE) < \'$mindate\' then \'$mindate\'
 *                       else CAST(a.date AS DATE)
 *               end as adate,
 *               case
 *                       when CAST(a.enddate AS DATE) > \'$maxdate\' then \'$maxdate\'
 *                       when CAST(a.enddate AS DATE) is null then \'$maxdate\'
 *                       else CAST(a.enddate AS DATE)
 *               end as edate,
 *               project.research as research
 *       from study.assignment a
 *       join
 *               (select h.id as id, h.room as room,
 *                       CASE
 *               WHEN h.room like 'ab10%' THEN 'AB-Old'
 *               WHEN h.room like 'ab11%' THEN 'AB-Old'
 *                  WHEN h.room like 'ab12%' THEN 'AB-Old'
 *               WHEN h.room like 'ab14%' THEN 'AB-New'
 *               WHEN h.room like 'ab16%' THEN 'AB-New'
 *               WHEN h.room like 'a1%' THEN 'A1/AB190'
 *               WHEN h.room like 'ab190%' THEN 'A1/AB190'
 *               WHEN h.room like 'a2%' THEN 'A2'
 *               WHEN h.room like 'bmq%' THEN 'BMQ'
 *               WHEN h.room like 'cb%' THEN 'CB'
 *               WHEN h.room like 'c3%' THEN 'C3'
 *               WHEN h.room like 'c4%' THEN 'C4'
 *               WHEN h.room like 'cif%' THEN 'Charmany'
 *               WHEN h.room like 'mr%' THEN 'WIMR'
 *               ELSE null
 *                       END as area
 *                       from study.housing h where (CAST(h.date as DATE) <= \'$maxdate\' and h.enddate is null) or (CAST(h.date as DATE) <= \'$maxdate\' and CAST(h.enddate as DATE) >= \'$mindate\')
 *               ) h
 *               on (a.id = h.id)
 *       where a.project = project.project and CAST(a.date as DATE) <= \'$maxdate\' and a.enddate is null or
 *       (CAST(a.date as DATE) <= \'$maxdate\' and CAST(a.enddate as DATE) >= \'$mindate\')
 *       order by a.Id, project.research desc
 */

PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

SELECT * FROM
    (
        SELECT
            assgn.Id AS id,
--             project,
            project.account AS account,
            hous.area AS location,
            CASE
                WHEN CAST(assgn.date AS DATE) < StartDate THEN StartDate
                ELSE CAST(assgn.date AS DATE)
            END AS adate,
            CASE
                WHEN CAST(assgn.enddate AS DATE) > EndDate THEN EndDate
                WHEN CAST(assgn.enddate AS DATE) IS NULL THEN EndDate
                ELSE CAST(assgn.enddate AS DATE)
            END AS edate,
            project.research AS research
        FROM study.assignment assgn
        JOIN
        (SELECT h.id AS id, h.room AS room, h.date, h.enddate,
                CASE
                    WHEN h.room LIKE 'ab10%' THEN 'AB-Old'
                    WHEN h.room LIKE 'ab11%' THEN 'AB-Old'
                    WHEN h.room LIKE 'ab12%' THEN 'AB-Old'
                    WHEN h.room LIKE 'ab14%' THEN 'AB-New'
                    WHEN h.room LIKE 'ab16%' THEN 'AB-New'
                    WHEN h.room LIKE 'a1%' THEN 'A1/AB190'
                    WHEN h.room LIKE 'ab190%' THEN 'A1/AB190'
                    WHEN h.room LIKE 'a2%' THEN 'A2'
                    WHEN h.room LIKE 'bmq%' THEN 'BMQ'
                    WHEN h.room LIKE 'cb%' THEN 'CB'
                    WHEN h.room LIKE 'c3%' THEN 'C3'
                    WHEN h.room LIKE 'c4%' THEN 'C4'
                    WHEN h.room LIKE 'cif%' THEN 'Charmany'
                    WHEN h.room LIKE 'mr%' THEN 'WIMR'
                    ELSE NULL
                END AS area
         FROM study.housing h
         WHERE
             (CAST(h.date AS DATE) <= EndDate AND h.enddate IS NULL)  OR
             (CAST(h.date AS DATE) <= EndDate AND CAST(h.enddate AS DATE) >= StartDate)
        ) hous
        ON (assgn.id = hous.id)
        WHERE
            assgn.project = project.project AND CAST(assgn.date AS DATE) <= EndDate AND assgn.enddate IS NULL  OR
            (CAST(assgn.date AS DATE) <= EndDate AND CAST(assgn.enddate AS DATE) >= StartDate)
    ) pd
    WHERE pd.research = TRUE -- only get research accounts
    GROUP BY -- group by to avoid duplicates rows when an animal is moved around in different rooms in a same day. For ex. animal id cj1363, for month of May 2016
        pd.id,
--         pd.project,
        pd.account,
        pd.location,
        pd.adate,
        pd.edate,
        pd.research