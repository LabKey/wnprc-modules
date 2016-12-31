/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, uuid, tableName, ts, orig_id
FROM deleted_records
WHERE ts > ?
AND (length(orig_id) > 1 OR orig_id is null)