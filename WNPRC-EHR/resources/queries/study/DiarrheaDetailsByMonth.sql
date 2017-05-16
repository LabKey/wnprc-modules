SELECT Id, "year", "month", "value", COUNT(*) as numTimes
FROM (
  SELECT Id, cast(year(dateOnly) as INTEGER) as "year", cast(month(dateOnly) as INTEGER) as "month", "value"
  FROM   study."DiarrheaObsDetails"
)

GROUP BY Id, "year", "month", "value"
ORDER BY "year", "month"
