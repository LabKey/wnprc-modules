SELECT b.date,b.enddate,b.Id,b.sireid,b.ejaculation,b.project,b.remark,b.performedby,
CASE
  WHEN
    EXISTS (SELECT 1 FROM study.pregnancies pr
      JOIN study.breeding_encounters be ON (CAST(pr.date_conception_early AS DATE) >= CAST(be.date AS DATE) AND CAST(pr.date_conception_late AS DATE) <= CAST(be.enddate AS DATE))
      WHERE pr.Id LIKE ('%' || b.Id || '%'))
  THEN 'Pregnancy'
  ELSE ''
END AS Outcome
FROM study.breeding_encounters b