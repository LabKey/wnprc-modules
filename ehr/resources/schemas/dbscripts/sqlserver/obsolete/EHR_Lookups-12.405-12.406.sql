/*
 * Copyright (c) 2014-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
DROP TABLE ehr_lookups.flag_values;
GO
CREATE TABLE ehr_lookups.flag_values (
    rowid int identity(1,1),
    category varchar(100),
    value varchar(1000),
    code integer,
    description varchar(2000),

    datedisabled datetime,

    container entityid NOT NULL,
    createdby int NOT NULL,
    created datetime NOT NULL,
    modifiedby int NOT NULL,
    modified datetime NOT NULL,

    CONSTRAINT PK_flag_values PRIMARY KEY (rowid)
);