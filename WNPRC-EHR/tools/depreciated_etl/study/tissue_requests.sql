/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as Id, FixDateTime(date, time) AS Date, (sex) as gender, (livedead) AS livedead, (wbo) AS wbo, (tissue) AS tissue, (source) AS source, (dest) AS dest, (recip) AS recip, (affil) AS affil, FixNewlines(remark) AS remark,
ts, uuid AS objectid
FROM tissue
WHERE ts > ?
AND length(id) > 1
