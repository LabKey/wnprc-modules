
PARAMETERS(MINDATE TIMESTAMP, MAXDATE TIMESTAMP)

-- 1. Gets total number of physical exams performed.
SELECT
    'Physical Exams Performed' AS "Report Type",
    COUNT(*) AS "Colony Total",
    COUNT(CASE WHEN d.species LIKE 'Capuchin' THEN 1 END) AS "Capuchin",
    COUNT(CASE WHEN d.species LIKE 'Cotton-top Tamarin' THEN 1 END) AS "Cotton-top Tamarin",
    COUNT(CASE WHEN d.species LIKE 'Cynomolgus' THEN 1 END) AS "Cynomolgus",
    COUNT(CASE WHEN d.species LIKE 'Galago Crassicaudatus' THEN 1 END) AS "Galago Crassicaudatus",
    COUNT(CASE WHEN d.species LIKE 'Marmoset' THEN 1 END) AS "Marmoset",
    COUNT(CASE WHEN d.species LIKE 'Pigtail' THEN 1 END) AS "Pigtail",
    COUNT(CASE WHEN d.species LIKE 'Rhesus' THEN 1 END) AS "Rhesus",
    COUNT(CASE WHEN d.species LIKE 'Stump Tailed' THEN 1 END) AS "Stump Tailed",
    COUNT(CASE WHEN d.species LIKE 'Unknown' THEN 1 END) AS "Unknown",
    COUNT(CASE WHEN d.species LIKE 'Vervet' THEN 1 END) AS "Vervet"
FROM
    encounters pe
        JOIN
    study.Demographics d ON pe.id = d.id
WHERE
    pe.type LIKE '%Physical Exam%'
  AND
    pe.date >= cast(MINDATE as date)
  AND
    pe.date <= cast (MAXDATE as date)

UNION ALL

-- 2. Gets total number of tb tests performed.
SELECT
    'TB Tests Performed' AS "Report Type",
    COUNT(*) AS "Colony Total",
    COUNT(CASE WHEN d.species LIKE 'Capuchin' THEN 1 END) AS "Capuchin",
    COUNT(CASE WHEN d.species LIKE 'Cotton-top Tamarin' THEN 1 END) AS "Cotton-top Tamarin",
    COUNT(CASE WHEN d.species LIKE 'Cynomolgus' THEN 1 END) AS "Cynomolgus",
    COUNT(CASE WHEN d.species LIKE 'Galago Crassicaudatus' THEN 1 END) AS "Galago Crassicaudatus",
    COUNT(CASE WHEN d.species LIKE 'Marmoset' THEN 1 END) AS "Marmoset",
    COUNT(CASE WHEN d.species LIKE 'Pigtail' THEN 1 END) AS "Pigtail",
    COUNT(CASE WHEN d.species LIKE 'Rhesus' THEN 1 END) AS "Rhesus",
    COUNT(CASE WHEN d.species LIKE 'Stump Tailed' THEN 1 END) AS "Stump Tailed",
    COUNT(CASE WHEN d.species LIKE 'Unknown' THEN 1 END) AS "Unknown",
    COUNT(CASE WHEN d.species LIKE 'Vervet' THEN 1 END) AS "Vervet"
FROM
    tb tb
        JOIN
    study.Demographics d ON tb.id = d.id
WHERE
    tb.date >= cast(MINDATE as date)
  AND
    tb.date <= cast (MAXDATE as date)

UNION ALL

-- 3. Gets total number of unique animals that received treatments.
SELECT
    'Unique Animals that Received Treatments' AS "Report Type",
    COUNT(DISTINCT tr.id) AS "Colony Total",
    COUNT(DISTINCT CASE WHEN d.species LIKE 'Capuchin' THEN tr.id END) AS "Capuchin",
    COUNT(DISTINCT CASE WHEN d.species LIKE 'Cotton-top Tamarin' THEN tr.id END) AS "Cotton-top Tamarin",
    COUNT(DISTINCT CASE WHEN d.species LIKE 'Cynomolgus' THEN tr.id END) AS "Cynomolgus",
    COUNT(DISTINCT CASE WHEN d.species LIKE 'Galago Crassicaudatus' THEN tr.id END) AS "Galago Crassicaudatus",
    COUNT(DISTINCT CASE WHEN d.species LIKE 'Marmoset' THEN tr.id END) AS "Marmoset",
    COUNT(DISTINCT CASE WHEN d.species LIKE 'Pigtail' THEN tr.id END) AS "Pigtail",
    COUNT(DISTINCT CASE WHEN d.species LIKE 'Rhesus' THEN tr.id END) AS "Rhesus",
    COUNT(DISTINCT CASE WHEN d.species LIKE 'Stump Tailed' THEN tr.id END) AS "Stump Tailed",
    COUNT(DISTINCT CASE WHEN d.species LIKE 'Unknown' THEN tr.id END) AS "Unknown",
    COUNT(DISTINCT CASE WHEN d.species LIKE 'Vervet' THEN tr.id END) AS "Vervet"
FROM
    treatment_order tr
        JOIN
    study.Demographics d ON tr.id = d.id
WHERE
    tr.QCState.label LIKE 'Completed'
  AND
    tr.date >= cast(MINDATE as date)
  AND
    tr.date <= cast (MAXDATE as date)

UNION ALL

-- 4. Gets total number of individual treatment events.
SELECT
    'Individual Treatment Events' AS "Report Type",
    COUNT(*) AS "Colony Total",
    COUNT(CASE WHEN d.species LIKE 'Capuchin' THEN 1 END) AS "Capuchin",
    COUNT(CASE WHEN d.species LIKE 'Cotton-top Tamarin' THEN 1 END) AS "Cotton-top Tamarin",
    COUNT(CASE WHEN d.species LIKE 'Cynomolgus' THEN 1 END) AS "Cynomolgus",
    COUNT(CASE WHEN d.species LIKE 'Galago Crassicaudatus' THEN 1 END) AS "Galago Crassicaudatus",
    COUNT(CASE WHEN d.species LIKE 'Marmoset' THEN 1 END) AS "Marmoset",
    COUNT(CASE WHEN d.species LIKE 'Pigtail' THEN 1 END) AS "Pigtail",
    COUNT(CASE WHEN d.species LIKE 'Rhesus' THEN 1 END) AS "Rhesus",
    COUNT(CASE WHEN d.species LIKE 'Stump Tailed' THEN 1 END) AS "Stump Tailed",
    COUNT(CASE WHEN d.species LIKE 'Unknown' THEN 1 END) AS "Unknown",
    COUNT(CASE WHEN d.species LIKE 'Vervet' THEN 1 END) AS "Vervet"
FROM
    treatment_order tr
        JOIN
    study.Demographics d ON tr.id = d.id
WHERE
    tr.QCState.label LIKE 'Completed'
  AND
    tr.date >= cast(MINDATE as date)
  AND
    tr.date <= cast (MAXDATE as date)