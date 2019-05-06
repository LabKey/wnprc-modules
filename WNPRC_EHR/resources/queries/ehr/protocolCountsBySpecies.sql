
SELECT
protocol,species, MAX(allowed) as countsBySpecies
FROM ehr.protocol_counts

GROUP BY species,protocol
PIVOT countsBySpecies by species