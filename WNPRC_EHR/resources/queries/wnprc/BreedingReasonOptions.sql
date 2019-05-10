SELECT '(Breeding Colony)' AS Name
UNION ALL
SELECT Name
FROM (SELECT DISTINCT inves AS Name
      FROM ehr.protocol
      ORDER BY inves ASC) _a