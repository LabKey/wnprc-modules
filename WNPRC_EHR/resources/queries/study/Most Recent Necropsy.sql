SELECT
Id,
date

FROM study.necropsies
WHERE cast(date as date) = cast((SELECT MAX(date) FROM study.necropsies WHERE QCState.Label = 'Completed') as date)