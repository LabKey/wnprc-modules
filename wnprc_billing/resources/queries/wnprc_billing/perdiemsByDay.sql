PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

-- expands account assignment date range into single day
SELECT
  *
FROM
  (SELECT
     dr.dateOnly AS singleDayDate,
     x.Id,
     x.account,
     x.project,
     x.adate,
     x.edate,
     x.locations
  FROM
  (
    SELECT
     CAST(i.date as date) as dateOnly
     FROM (
          SELECT timestampadd('SQL_TSI_DAY', i.value, CAST(COALESCE(CAST(StartDate as date), curdate()) AS TIMESTAMP)) as date
          FROM ldk.integers i
          WHERE i.value < (TIMESTAMPDIFF('SQL_TSI_DAY', EndDate, StartDate)+1)
     ) i
  )dr --version of ldk.dateRange

  LEFT JOIN

   (SELECT
     pds.Id,
     pds.account,
     pds.project,
     pds.adate,
     pds.edate,
     group_concat(pds.location, ',') AS locations
    FROM wnprc_billing.perDiems pds
    GROUP BY
     pds.Id,
     pds.account,
     pds.project,
     pds.adate,
     pds.edate
   ) x

   ON dr.dateOnly between x.adate AND x.edate) pbd

--don't charge a per diem for an animal for any day that it's on
--a project with a 'ph' availability code (ehr.project.avail)
WHERE NOT EXISTS(
    SELECT 1
    FROM studyLinked.assignment asgnmt
    WHERE pbd.Id = asgnmt.Id
      AND CAST(pbd.singleDayDate AS DATE) >= CAST(asgnmt.date AS DATE)
      AND (CAST(pbd.singleDayDate AS DATE) <= CAST(asgnmt.enddate AS DATE) OR asgnmt.enddate IS NULL)
      AND asgnmt.project.avail = 'ph'
    )