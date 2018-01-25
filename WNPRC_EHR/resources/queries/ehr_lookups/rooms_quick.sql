/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  DISTINCT c.room as room,

  CASE
    WHEN c.room like 'ab10%' THEN 'AB-Old'
    WHEN c.room like 'ab11%' THEN 'AB-Old'
    WHEN c.room like 'ab12%' THEN 'AB-Old'
    WHEN c.room like 'ab14%' THEN 'AB-New'
    WHEN c.room like 'ab16%' THEN 'AB-New'
    WHEN c.room like 'a1%' THEN 'A1/AB190'
    WHEN c.room like 'ab190%' THEN 'A1/AB190'
    WHEN c.room like 'a2%' THEN 'A2'
    WHEN c.room like 'bmq%' THEN 'BMQ'
    WHEN c.room like 'cb%' THEN 'CB'
    WHEN c.room like 'c3%' THEN 'C3'
    WHEN c.room like 'c4%' THEN 'C4'    
    WHEN c.room like 'cif%' THEN 'Charmany'
    WHEN c.room like 'mr%' THEN 'WIMR'
    ELSE null
  END as area
  
FROM ehr_lookups.cage c
where c.room != '' and c.room is not null
group by c.room