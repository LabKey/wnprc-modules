/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
Id,
GROUP_CONCAT(behavior, '; ') as currentBehaviors,


/*
 * For some reason, you need to include this column to assure performance on the demographics table.
 * Without it, loading the demographics table with the "Behavior - Current"/Behavior column selected
 * sometimes takes forever (but not always)...
 */
visitRowId

FROM study.BehaviorAbstract behavior
WHERE (
  -- Only show current
  (behavior.enddate IS NULL)
  OR
  (behavior.enddate > curdate())
)
GROUP BY Id, visitRowId