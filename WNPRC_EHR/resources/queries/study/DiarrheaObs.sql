/*
PARAMETERS (
  animalId VARCHAR
)
*/

SELECT Id, dateOnly, feces
FROM   study."Irregular Obs No Okays" obs
WHERE  obs.feces IS NOT NULL
--       AND
--       obs.Id = animalId