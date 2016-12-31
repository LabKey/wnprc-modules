/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  convert((year(curdate()) - i.value), integer) as year,
  m.month,
  m.rowid as MonthNum,
  
FROM ldk.integers i
CROSS JOIN ehr_lookups.months m


WHERE i.value < 5
