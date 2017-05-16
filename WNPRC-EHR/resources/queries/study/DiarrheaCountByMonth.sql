
SELECT Id, "year", "month", COUNT(*) as numTimes
FROM (
  SELECT Id, cast(year(dateOnly) as INTEGER) as "year", cast(month(dateOnly) as INTEGER) as "month"
  FROM   study."DiarrheaObs"
)
GROUP BY Id, "year", "month"
ORDER BY "year", "month" DESC
