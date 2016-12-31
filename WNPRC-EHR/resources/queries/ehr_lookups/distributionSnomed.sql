/*
 * Copyright (c) 2012-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/*
*
*
*
*/
SELECT 
code.meaning || ' (' || code.code || ')' as distributionVal
FROM snomed_subset_codes s
WHERE s.primaryCategory = 'Distribution'
;
