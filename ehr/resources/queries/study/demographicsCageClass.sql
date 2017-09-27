/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
d.id.MostRecentWeight.MostRecentWeight as MostRecentWeight,
 
c.sqft as ReqSqFt,

c.height as ReqHeight

from study.demographics d

LEFT JOIN ehr_lookups.cageclass c

ON (c.low < d.id.MostRecentWeight.MostRecentWeight AND d.id.MostRecentWeight.MostRecentWeight <= c.high)

WHERE
--d.id.status.status = 'Alive'
d.calculated_status = 'Alive' and c.requirementset = 'The Guide'
