/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*
 * This query grabs all of the rows from ehr.cage_observations that indicate an okay room.
 */

SELECT * FROM ehr.cage_observations as cage_obs
WHERE (cage_obs.cage IS NULL) AND (cage_obs.no_observations = TRUE)