/*
 * Copyright (c) 2010-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

p.protocol,
p.approve,
p.species,
pc.allowed,
p.TotalAnimals,
CONVERT(pc.allowed - p.TotalAnimals, INTEGER) as TotalRemaining,
CASE WHEN (pc.allowed IS NULL or pc.allowed = 0) THEN NULL ELSE round(cast(p.TotalAnimals as float) / cast(pc.allowed as float) * 100, 1) END as PercentUsed,
p.Animals

FROM
(
SELECT
  coalesce(p.protocol, pa.protocol) as protocol,
  p.approve,
  pa.species,
  group_concat(DISTINCT pa.id) as Animals,
  CONVERT(Count(pa.id), INTEGER) AS TotalAnimals

FROM ehr.protocol p
LEFT OUTER JOIN ehr.protocolAnimals pa ON (p.protocol = pa.protocol)

GROUP BY coalesce(p.protocol, pa.protocol), p.approve, pa.species

/*
 * Calculate the macaque totals as well, as the sum of Cynos and Rhesus
 */
UNION
SELECT
  coalesce(p.protocol, pa.protocol) as protocol,
  p.approve,
  'Macaque' as species,
  group_concat(DISTINCT pa.id) as Animals,
  CONVERT(Count(pa.id), INTEGER) AS TotalAnimals

FROM ehr.protocol p
  LEFT OUTER JOIN ehr.protocolAnimals pa ON (p.protocol = pa.protocol)

  WHERE pa.species = 'Cynomolgus' OR pa.species = 'Rhesus'

GROUP BY coalesce(p.protocol, pa.protocol), p.approve

  /* End   Edit */

) p

LEFT JOIN ehr.protocol_counts pc ON (p.protocol = pc.protocol AND pc.species = p.species)

WHERE p.species IS NOT NULL


UNION ALL


SELECT
  p.protocol,
  p.approve,
  'All Species' as species,
  p.maxAnimals as allowed,
  CONVERT(Count(pa.id), INTEGER) AS TotalAnimals,
  p.maxAnimals - Count(pa.id) as TotalRemaining,
  CASE WHEN (p.maxAnimals IS NULL or p.maxAnimals = 0) THEN NULL ELSE round(cast(Count(pa.id) as float) / cast(p.maxAnimals as float) * 100, 1) END as PercentUsed,
  group_concat(distinct pa.Id) as animals

FROM ehr.protocol p
LEFT OUTER JOIN ehr.protocolAnimals pa ON (p.protocol = pa.protocol)
WHERE p.maxAnimals IS NOT NULL
GROUP BY p.protocol, p.approve, p.maxAnimals

