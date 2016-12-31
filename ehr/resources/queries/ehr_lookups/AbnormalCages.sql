/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
select * from ehr_lookups.cage c
where
(c.length > 50 OR c.width > 50)
and c.cage not like '%pen%'