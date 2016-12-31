/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/* EHR_Lookups-16.22-16.23.sql */

CREATE TABLE ehr_lookups.calendar (
    TargetDateTime TIMESTAMP NOT NULL,
    TargetDate DATE NOT NULL,
    DayAfter DATE NOT NULL,
    Month INT NOT NULL,
    Day int NOT NULL,
    Year int NOT NULL
);

-- Populate via Java code instead of hard-coding thousands of date rows
SELECT core.executeJavaUpgradeCode('populateCalendar');

/* EHR_Lookups-16.23-16.24.sql */

DROP INDEX ehr_lookups.ehr_lookups_set_name_value;
CREATE UNIQUE INDEX ehr_lookups_set_name_value_container ON ehr_lookups.lookups (set_name, value, container);