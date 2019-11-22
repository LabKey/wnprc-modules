PARAMETERS
(START_DATE TIMESTAMP, END_DATE TIMESTAMP)

SELECT id
     , GROUP_CONCAT(project, ', ')       as Projects
     , GROUP_CONCAT(date, ', ')          as AssignmentDates
     , GROUP_CONCAT(enddate, ', ')       as ReleaseDates
     , GROUP_CONCAT(project.avail, ', ') as ProjectAvails
FROM study.assignment
WHERE date <= END_DATE
  AND (enddate >= START_DATE OR enddate IS NULL)
  AND (project.avail = 'r' OR project.avail = 'rr' OR project.avail = 'n')
GROUP BY id;
