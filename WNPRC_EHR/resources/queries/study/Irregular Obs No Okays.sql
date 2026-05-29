/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/*
 * This query filters irregularObsById to remove OK Rooms and OK Cages.
 */

SELECT * FROM study.irregularObsById AS obs
WHERE (
  (obs.everything_ok = FALSE)
  AND
  (obs.qcstate.publicdata = TRUE)
)