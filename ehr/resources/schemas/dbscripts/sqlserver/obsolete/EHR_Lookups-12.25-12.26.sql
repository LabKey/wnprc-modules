/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DELETE FROM ehr.qcStateMetadata WHERE QCStateLabel = 'Request: Complete';
INSERT INTO ehr.qcStateMetadata
(QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates)
VALUES ('Request: Complete', 0, 0, 1, 1);