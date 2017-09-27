/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
UPDATE ehr.qcStateMetadata SET draftData = 1 WHERE QCStateLabel = 'Review Required';