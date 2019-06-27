PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  be.date,
  be.enddate,
  be.sireid,
  be.ejaculation,
  be.project,
  be.remark,
  be.performedby,
  be.outcome
FROM breeding_encounters be
WHERE be.lsid = (SELECT p.breedingencounterid
                       FROM pregnancies p
                       WHERE p.objectid = PARENT_RECORD_ID
                       LIMIT 1)
ORDER BY be.date DESC