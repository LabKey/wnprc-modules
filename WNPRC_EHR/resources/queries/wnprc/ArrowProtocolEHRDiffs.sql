--used to find rows that do not exist in arrow connection but not in ehr protocol, for deletion in ETL
SELECT protocol as protocol_id,
       modified as date_modified
FROM ehr.protocol a
WHERE NOT EXISTS
    (SELECT w.protocol_id as protocol
     FROM wnprc.MaxSpeciesDistinct w
     WHERE lower(w.protocol_id) = lower(a.protocol))
AND a.protocol != 'wprc00';