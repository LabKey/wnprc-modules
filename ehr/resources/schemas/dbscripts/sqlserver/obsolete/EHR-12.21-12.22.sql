/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr.chargedItems (
    rowid INT IDENTITY (1,1) NOT NULL,
    id varchar(100),
    date DATETIME,
    debitedaccount varchar(100),
    creditedaccount varchar(100),
    category varchar(100),
    item varchar(500),
    quantity double precision,
    unitcost double precision,
    totalcost double precision,
    comment varchar(4000),
    flag integer,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created DATETIME,
    modifiedBy USERID,
    modified DATETIME,

    CONSTRAINT PK_charged_items PRIMARY KEY (RowId)
);

ALTER TABLE ehr.snomed_tags ADD schemaName varchar(100);
ALTER TABLE ehr.snomed_tags ADD queryName varchar(100);
ALTER TABLE ehr.snomed_tags ADD qualifier varchar(200);
ALTER TABLE ehr.snomed_tags ADD sort integer;

CREATE TABLE ehr.accounts (
    account varchar(100),
    "grant" varchar(100),
    investigator integer,
    startdate DATETIME,
    enddate DATETIME,
    externalid varchar(200),
    comment varchar(4000),
    tier integer,

    createdBy USERID,
    created DATETIME,
    modifiedBy USERID,
    modified DATETIME,

    CONSTRAINT PK_accounts PRIMARY KEY (account)
);

CREATE TABLE ehr.investigators (
    RowId  int identity(1,1) NOT NULL,
    FirstName varchar(100),
    LastName varchar(100),
    Position varchar(100),
    Address varchar(500),
    City varchar(100),
    State varchar(100),
    Country varchar(100),
    ZIP integer,
    PhoneNumber varchar(100),
    InvestigatorType varchar(100),
    EmailAddress varchar(100),
    DateCreated datetime,
    DateDisabled datetime,
    Division varchar(100),

    --container entityid,
    createdby userid,
    created datetime,
    modifiedby userid,
    modified datetime,
    CONSTRAINT pk_investigators PRIMARY KEY (rowid)
);