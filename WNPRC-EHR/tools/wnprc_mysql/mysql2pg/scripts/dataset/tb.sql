/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDate(date) AS Date, (lot) AS lot, (dilution) AS dilution, (eye) AS eye, (result1) AS result1, (result2) AS result2, (result3) AS result3,
ts, uuid AS objectid

FROM tb
WHERE id not like "|%"