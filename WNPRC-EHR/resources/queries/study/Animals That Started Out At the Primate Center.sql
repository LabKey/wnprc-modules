/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 * This query presents a list of animals that originated with the primate center, and so have no
 * birth or arrival date.
 */

SELECT Id, species FROM (

  SELECT births.Id, arrivals.hasArrival, demo.species
  FROM (
    SELECT * FROM study."Per Animal Birth"
    WHERE (date IS NULL)
  ) as births

  LEFT JOIN (
    SELECT Id, TRUE as hasArrival
    FROM study."Per Animal Arrival"
    GROUP BY Id
  ) as arrivals
  ON (births.Id = arrivals.Id)

  LEFT JOIN (
    SELECT Id,species FROM study.demographics
  ) as demo
  ON (demo.Id = births.Id)

) as animals
WHERE animals.hasArrival IS NULL
