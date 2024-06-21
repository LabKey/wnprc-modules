/*
 * Copyright (c) 2011-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

    p.protocol,
    (select approve from ehr.protocol where p.protocol = protocol) as approve,
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
            p.species as species,
            group_concat(DISTINCT pa.id) as Animals,
            CONVERT(Count(pa.id), INTEGER) AS TotalAnimals

        FROM ehr.protocol_counts p
                 LEFT OUTER JOIN ehr.protocolAnimals pa ON (p.protocol = pa.protocol and p.species = pa.species)

        WHERE p.species != 'Macaque'
        GROUP BY coalesce(p.protocol, pa.protocol), p.species

        UNION

        /*
         * Calculate the macaque totals as well, as the sum of Cynos and Rhesus
         */

        SELECT
            coalesce(p.protocol, pa.protocol) as protocol,
            'Macaque' as species,
            group_concat(DISTINCT pa.id) as Animals,
            CONVERT(Count(pa.id), INTEGER) AS TotalAnimals

        FROM ehr.protocol_counts p
            LEFT OUTER JOIN ehr.protocolAnimals pa ON (p.protocol = pa.protocol and p.species = pa.species)


        WHERE pa.species = 'Cynomolgus' OR pa.species = 'Rhesus'

          AND EXISTS (  -- Check if 'macaque' exists for protocol
            SELECT 1
            FROM ehr.protocol_counts pc2
            WHERE pc2.protocol = p.protocol AND pc2.species = 'Macaque'
            )
        GROUP BY coalesce(p.protocol, pa.protocol), p.species


    ) p

        LEFT JOIN ehr.protocol_counts pc ON (p.protocol = pc.protocol AND pc.species = p.species)

WHERE p.species IS NOT NULL


UNION ALL


SELECT
    p.protocol,
    (select approve from ehr.protocol where p.protocol = protocol) as approve,
    'All Species' as species,
    p.maxAnimals as allowed,
    CONVERT(Count(pa.id), INTEGER) AS TotalAnimals,
    p.maxAnimals - Count(pa.id) as TotalRemaining,
    CASE WHEN (p.maxAnimals IS NULL or p.maxAnimals = 0) THEN NULL ELSE round(cast(Count(pa.id) as float) / cast(p.maxAnimals as float) * 100, 1) END as PercentUsed,
    group_concat(distinct pa.Id) as animals

FROM ehr.protocol p
         LEFT OUTER JOIN ehr.protocolAnimals pa ON (p.protocol = pa.protocol)
WHERE p.maxAnimals IS NOT NULL
GROUP BY p.protocol, p.maxAnimals