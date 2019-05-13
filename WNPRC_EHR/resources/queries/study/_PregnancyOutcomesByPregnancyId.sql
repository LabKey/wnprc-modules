PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  po.date,
  po.outcome,
  po.infantid,
  po.rejected,
  po.protected,
  po.project,
  po.remark,
  po.performedby
FROM pregnancy_outcomes po
WHERE po.pregnancyid = (SELECT p.lsid
                        FROM pregnancies p
                        WHERE p.objectid = PARENT_RECORD_ID
                        LIMIT 1)
ORDER BY po.date DESC