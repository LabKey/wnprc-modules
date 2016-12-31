/*
 * Copyright (c) 2011-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
DisplayName as UserId,
UserId as internalUserID,
CASE
  WHEN ((firstName IS NOT NULL ) AND (lastName IS NOT NULL))
  THEN (firstName || ' ' || lastName || ' (' || DisplayName || ')')

  ELSE DisplayName
END as displayName,


FROM core.users
WHERE (
  ISMEMBEROF((SELECT MIN(UserId) FROM core.Groups WHERE Name like '%pathology%'), UserId)
  AND
  DisplayName IS NOT NULL
  AND
  DisplayName != ''
)
;
