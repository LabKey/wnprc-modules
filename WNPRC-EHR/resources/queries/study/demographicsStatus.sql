/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--TODO: verify number of rows unchanged
SELECT
  a.id,

--alive
--shipped
--d-other
--d-quar
--d-expr

CASE
  WHEN
    (a.dataset.demographics.created IS NULL)
    THEN 'No Information'
  WHEN
    (a.dataset.demographics.birth IS NULL AND a.dataset.demographics.arrivedate IS NULL)
    THEN 'Never at Center'
  WHEN
    (a.dataset.demographics.death IS NOT NULL)
    THEN 'Dead'
  WHEN
    (a.dataset.demographics.departdate IS NOT NULL AND (a.dataset.demographics.arrivedate IS NULL OR a.dataset.demographics.departdate > a.dataset.demographics.arrivedate))
    THEN 'Shipped'
  WHEN
    (a.dataset.demographics.birth IS NOT NULL OR a.dataset.demographics.arrivedate IS NOT NULL) AND (a.dataset.demographics.departdate IS NULL OR a.dataset.demographics.departdate < a.dataset.demographics.arrivedate)
    THEN 'Alive'
  ELSE
    'ERROR'
END as status

--determine whether animal was ever at the center
--possibly also use housing as proxy
-- CASE
--   WHEN
--     (a.dataset.demographics.birth IS NOT NULL OR a.dataset.demographics.arrivedate IS NOT NULL)
--     THEN true
--   ELSE
--     false
-- END AS Center_Animal,

FROM study.animal a

