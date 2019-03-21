SELECT
  y.*,
  pg.lsid pregnancyid
FROM (SELECT
        b.dam    dam,
        b.date   date,
        b.id     infantid,
        'birth'  outcome,
        NULL     project,
        b.remark remark
      FROM study.birth b
      UNION
      SELECT
        p.dam      dam,
        p.date     date,
        p.id       infantid,
        'prenatal' outcome,
        p.project  project,
        p.remark   remark
      FROM study.prenatal p
     ) y
  INNER JOIN study.pregnancies pg
    ON y.dam = pg.id
       AND y.date = pg.date
WHERE y.dam IS NOT NULL
      AND y.dam <> 'unknown'