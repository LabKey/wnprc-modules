/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.flag_values (
    rowid int identity(1,1),
    category varchar(100),
    flag_value varchar(1000),
    int_value integer,

    container entityid,
    created datetime,
    createdby int,
    modified datetime,
    modifiedby int
);

ALTER TABLE ehr_lookups.procedures DROP COLUMN timeofmeds;