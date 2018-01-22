SELECT
Id,
Id.Dataset.Demographics.gender,
project,
project.protocol,
project.title,
project.avail,
project.inves,
"date",
endDate,
remark,
lsid,
projectedRelease

FROM study.assignment
WHERE (
  project.avail IN ('a1', 'a2', 'a3', 'a4', 'ip','ai')
  AND
  (
    enddate IS NULL
    OR
    cast(enddate as DATE) >= curdate()
  )
)