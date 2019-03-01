PARAMETERS ( SPECIES VARCHAR, SEARCH_COLUMN_NAME VARCHAR )
SELECT
  po.date,
  po.performedby,
  po.outcome,
  po.infantid,
  po.project,
  po.remark
FROM pregnancy_outcomes po
WHERE po.pregnancyid = (SELECT p.lsid
                        FROM pregnancies p
                        WHERE p.objectid = PARENT_RECORD_ID
                        LIMIT 1)
ORDER BY po.date DESC