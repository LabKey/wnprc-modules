--add pregnancy outcome to breeding_encounters query
SELECT be.date,be.enddate,be.Id,be.sireid,be.ejaculation,be.project,be.remark,be.performedby
FROM study.breeding_encounters