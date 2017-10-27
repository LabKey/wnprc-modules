/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /* wnprc_billing-17.20-17.21.sql */

/*
  * Background:
  * Postgres Db scripts onprc_billing-12.xxx-12.xxx were written for ONPRC Billing Module in 2014, then later discarded just keeping
  * scripts for SQL Server.
  * For WNPRC Billing - We digged out ONPRC Billing's Postgres scripts onprc_billing-12.301-12.302.sql to onprc_billing-12.370-12.371.sql;
  * and renamed them to wnprc_billing-12.301-12.302.sql to wnprc_billing-12.370-12.371.sql respectively, and then consolidated using Consolidate Scripts
  * (from Admin Console > SQL Scipts > Consolidate Scripts).
  * This file consists result of this consolidation (hence you'll see comments such as 'wnprc_billing-12.30-12.301.sql'
  * below, which corresponds to onprc_billing-12.30-12.301.sql, for example.)
  * Additionally, recent-ish (from 2016) changes from onprc_billing are also included.
  */

 /* wnprc_billing-12.30-12.301.sql */

CREATE SCHEMA wnprc_billing;

/* wnprc_billing-12.301-12.302.sql */

--this table contains one row each time a billing run is performed, which gleans items to be charged from a variety of sources
--and snapshots them into invoicedItems
CREATE TABLE wnprc_billing.invoiceRuns (
    rowId SERIAL NOT NULL,
    date timestamp,
    dataSources varchar(1000),
    runBy userid,
    comment varchar(4000),

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_invoiceRuns PRIMARY KEY (rowId)
);

--this table contains a snapshot of items actually invoiced, which will draw from many places in the animal record
CREATE TABLE wnprc_billing.invoicedItems (
    rowId SERIAL NOT NULL,
    id varchar(100),
    date timestamp,
    debitedaccount varchar(100),
    creditedaccount varchar(100),
    category varchar(100),
    item varchar(500),
    quantity double precision,
    unitcost double precision,
    totalcost double precision,
    chargeId int,
    rateId int,
    exemptionId int,
    comment varchar(4000),
    flag integer,
    sourceRecord varchar(200),
    billingId int,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_billedItems PRIMARY KEY (rowId)
);


--this table contains a list of all potential items that can be charged.  it maps between the integer ID
--and a descriptive name.  it does not contain any fee information
CREATE TABLE wnprc_billing.chargableItems (
    rowId SERIAL NOT NULL,
    name varchar(200),
    category varchar(200),
    comment varchar(4000),
    active boolean default true,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_chargableItems PRIMARY KEY (rowId)
);

--this table contains a list of the current changes for each item in wnprc_billing.charges
--it will retain historic information, so we can accurately determine 'cost at the time'
CREATE TABLE wnprc_billing.chargeRates (
    rowId SERIAL NOT NULL,
    chargeId int,
    unitcost double precision,
    unit varchar(100),
    startDate timestamp,
    endDate timestamp,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_chargeRates PRIMARY KEY (rowId)
);

--contains records of project-specific exemptions to chargeRates
CREATE TABLE wnprc_billing.chargeRateExemptions (
    rowId SERIAL NOT NULL,
    project int,
    chargeId int,
    unitcost double precision,
    unit varchar(100),
    startDate timestamp,
    endDate timestamp,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_chargeRateExemptions PRIMARY KEY (rowId)
);

--maps the account to be credited for each charged item
CREATE TABLE wnprc_billing.creditAccount (
    rowId SERIAL NOT NULL,
    chargeId int,
    account int,
    startDate timestamp,
    endDate timestamp,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_creditAccount PRIMARY KEY (rowId)
);

--this table contains records of misc charges that have happened that cannot otherwise be
--automatically inferred from the record
CREATE TABLE wnprc_billing.miscCharges (
    rowId SERIAL NOT NULL,
    id varchar(100),
    date timestamp,
    project integer,
    account varchar(100),
    category varchar(100),
    chargeId int,
    descrption varchar(1000), --usually null, allow other random values to be supported
    quantity double precision,
    unitcost double precision,
    totalcost double precision,
    comment varchar(4000),

    taskid entityid,
    requestid entityid,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_miscCharges PRIMARY KEY (rowId)
);


--this table details how to calculate lease fees, and produces a list of charges over a billing period
--no fee info is contained
CREATE TABLE wnprc_billing.leaseFeeDefinition (
    rowId SERIAL NOT NULL,
    minAge int,
    maxAge int,

    assignCondition int,
    releaseCondition int,
    chargeId int,

    active boolean default true,
    objectid ENTITYID,
    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT PK_leaseFeeDefinition PRIMARY KEY (rowId)
);

--this table details how to calculate lease fees, and produces a list of charges over a billing period
--no fee info is contained
CREATE TABLE wnprc_billing.perDiemFeeDefinition (
    rowId SERIAL NOT NULL,
    chargeId int,
    housingType int,
    housingDefinition int,

    startdate timestamp,
    releaseCondition int,

    active boolean default true,
    objectid ENTITYID,
    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT PK_perDiemFeeDefinition PRIMARY KEY (rowId)
);

--creates list of all procedures that are billable
CREATE TABLE wnprc_billing.clinicalFeeDefinition (
    rowId SERIAL NOT NULL,
    procedureId int,
    snomed varchar(100),

    active boolean default true,
    objectid ENTITYID,
    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT PK_clinicalFeeDefinition PRIMARY KEY (rowId)
);

/* wnprc_billing-12.302-12.303.sql */

ALTER TABLE wnprc_billing.chargeRates drop column unit;
ALTER TABLE wnprc_billing.chargeRateExemptions drop column unit;

alter table wnprc_billing.leaseFeeDefinition add project int;

alter table wnprc_billing.chargableItems add shortName varchar(100);

CREATE TABLE wnprc_billing.procedureFeeDefinition (
  rowid serial,
  procedureId int,
  chargeType int,
  chargeId int,

  active boolean default true,
  objectid ENTITYID,
  createdBy int,
  created timestamp,
  modifiedBy int,
  modified timestamp,

  CONSTRAINT PK_procedureFeeDefinition PRIMARY KEY (rowId)
);

CREATE TABLE wnprc_billing.financialContacts (
    rowid serial,
    firstName varchar(100),
    lastName varchar(100),
    position varchar(100),
    address varchar(500),
    city varchar(100),
    state varchar(100),
    country varchar(100),
    zip varchar(100),
    phoneNumber varchar(100),

    active boolean default true,
    objectid ENTITYID,
    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT PK_financialContacts PRIMARY KEY (rowId)
);

CREATE TABLE wnprc_billing.grants (
    "grant" varchar(100),
    investigatorId int,
    title varchar(500),
    startDate timestamp,
    endDate timestamp,
    fiscalAuthority int,

    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT PK_grants PRIMARY KEY ("grant")
);

CREATE TABLE wnprc_billing.accounts (
    account varchar(100),
    "grant" varchar(100),
    investigator integer,
    startdate timestamp,
    enddate timestamp,
    externalid varchar(200),
    comment varchar(4000),
    fiscalAuthority int,
    tier integer,
    active boolean default true,

    objectid entityid,
    createdBy userid,
    created timestamp,
    modifiedBy userid,
    modified timestamp,

    CONSTRAINT PK_accounts PRIMARY KEY (account)
);

/* wnprc_billing-12.303-12.304.sql */

drop table wnprc_billing.financialContacts;

CREATE TABLE wnprc_billing.fiscalAuthorities (
    rowid serial,
    faid varchar(100),
    firstName varchar(100),
    lastName varchar(100),
    position varchar(100),
    address varchar(500),
    city varchar(100),
    state varchar(100),
    country varchar(100),
    zip varchar(100),
    phoneNumber varchar(100),

    active boolean default true,
    objectid ENTITYID,
    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT pk_fiscalAuthorities PRIMARY KEY (rowId)
);

/* wnprc_billing-12.304-12.305.sql */

CREATE TABLE wnprc_billing.projectAccountHistory (
  rowid serial,
  project int,
  account varchar(200),
  startdate timestamp,
  enddate timestamp,
  objectid entityid,
  createdby userid,
  created timestamp,
  modifiedby userid,
  modified timestamp
);

/* wnprc_billing-12.305-12.306.sql */

DROP TABLE wnprc_billing.chargableItems;

CREATE TABLE wnprc_billing.chargeableItems (
    rowId SERIAL NOT NULL,
    name varchar(200),
    shortName varchar(100),
    category varchar(200),
    comment varchar(4000),
    active boolean default true,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_chargeableItems PRIMARY KEY (rowId)
);

/* wnprc_billing-12.307-12.308.sql */

ALTER TABLE wnprc_billing.projectAccountHistory ADD CONSTRAINT PK_projectAccountHistory PRIMARY KEY  (rowid);

/* wnprc_billing-12.309-12.310.sql */

DROP TABLE wnprc_billing.grants ;

CREATE TABLE wnprc_billing.grants (
    grantNumber varchar(100),
    investigatorId int,
    title varchar(500),
    startDate timestamp,
    endDate timestamp,
    fiscalAuthority int,
    fundingAgency varchar(200),
    grantType varchar(200),

    totalDCBudget double precision,
    totalFABudget double precision,
    budgetStartDate timestamp,
    budgetEndDate timestamp,

    agencyAwardNumber varchar(200),
    comment text,

    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT PK_grants PRIMARY KEY (grantNumber)
);


DROP TABLE wnprc_billing.accounts;

CREATE TABLE wnprc_billing.grantProjects (
  rowid serial,
  projectNumber varchar(200),
  grantNumber varchar(200),
  fundingAgency varchar(200),
  grantType varchar(200),
  agencyAwardNumber varchar(200),
  investigatorId int,
  alias varchar(200),
  projectTitle varchar(4000),
  projectDescription varchar(4000),
  currentYear int,
  totalYears int,
  awardSuffix varchar(200),
  organization varchar(200),

  awardStartDate timestamp,
  awardEndDate timestamp,
  budgetStartDate timestamp,
  budgetEndDate timestamp,
  currentDCBudget double precision,
  currentFABudget double precision,
  totalDCBudget double precision,
  totalFABudget double precision,

  spid varchar(100),
  fiscalAuthority int,
  comment text,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_grantProjects PRIMARY KEY (rowid)
);

CREATE TABLE wnprc_billing.iacucFundingSources (
  rowid serial,
  protocol varchar(200),
  grantNumber varchar(200),
  projectNumber varchar(200),

  startdate timestamp,
  enddate timestamp,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_iacucFundingSources PRIMARY KEY (rowid)
);

/* wnprc_billing-12.310-12.311.sql */

alter table wnprc_billing.leaseFeeDefinition drop column project;

/* wnprc_billing-12.315-12.316.sql */

ALTER Table wnprc_billing.invoicedItems DROP COLUMN flag;

ALTER Table wnprc_billing.invoicedItems ADD credit boolean;
ALTER Table wnprc_billing.invoicedItems ADD lastName varchar(100);
ALTER Table wnprc_billing.invoicedItems ADD firstName varchar(100);
ALTER Table wnprc_billing.invoicedItems ADD project int;
ALTER Table wnprc_billing.invoicedItems ADD invoiceDate timestamp;
ALTER Table wnprc_billing.invoicedItems ADD invoiceNumber int;
ALTER Table wnprc_billing.invoicedItems ADD transactionType varchar(10);
ALTER Table wnprc_billing.invoicedItems ADD department varchar(100);
ALTER Table wnprc_billing.invoicedItems ADD mailcode varchar(20);
ALTER Table wnprc_billing.invoicedItems ADD contactPhone varchar(30);
ALTER Table wnprc_billing.invoicedItems ADD faid int;
ALTER Table wnprc_billing.invoicedItems ADD cageId int;
ALTER Table wnprc_billing.invoicedItems ADD objectId entityid;

ALTER Table wnprc_billing.invoiceRuns ADD runDate timestamp;

/* wnprc_billing-12.316-12.317.sql */

ALTER Table wnprc_billing.invoiceRuns ADD billingPeriodStart timestamp;
ALTER Table wnprc_billing.invoiceRuns ADD billingPeriodEnd timestamp;

/* wnprc_billing-12.317-12.318.sql */

ALTER Table wnprc_billing.chargeableItems ADD itemCode varchar(100);
ALTER Table wnprc_billing.chargeableItems ADD departmentCode varchar(100);
ALTER Table wnprc_billing.invoicedItems ADD itemCode varchar(100);

/* wnprc_billing-12.318-12.319.sql */

ALTER Table wnprc_billing.procedureFeeDefinition DROP COLUMN chargeType;
ALTER Table wnprc_billing.procedureFeeDefinition ADD billedby varchar(100);

/* wnprc_billing-12.319-12.320.sql */

ALTER Table wnprc_billing.invoiceRuns ADD objectid entityid;

/* wnprc_billing-12.320-12.321.sql */

ALTER Table wnprc_billing.procedureFeeDefinition DROP COLUMN billedby;
ALTER Table wnprc_billing.procedureFeeDefinition ADD chargetype varchar(100);

/* wnprc_billing-12.321-12.322.sql */

ALTER TABLE wnprc_billing.invoiceRuns ALTER COLUMN objectid SET NOT NULL;

SELECT core.fn_dropifexists('invoiceRuns', 'wnprc_billing', 'CONSTRAINT', 'pk_invoiceRuns');

ALTER TABLE wnprc_billing.invoiceRuns ADD CONSTRAINT pk_invoiceRuns PRIMARY KEY (objectid);

ALTER TABLE wnprc_billing.invoicedItems ADD creditAccountId int;
ALTER TABLE wnprc_billing.invoicedItems ADD invoiceId entityid;

/* wnprc_billing-12.322-12.323.sql */

CREATE TABLE wnprc_billing.labworkFeeDefinition (
  rowid serial,
  servicename varchar(200),
  chargeType int,
  chargeId int,

  active bool default true,
  objectid ENTITYID,
  createdBy int,
  created timestamp,
  modifiedBy int,
  modified timestamp,

  CONSTRAINT PK_labworkFeeDefinition PRIMARY KEY (rowId)
);

/* wnprc_billing-12.323-12.324.sql */

ALTER TABLE wnprc_billing.invoicedItems ADD servicecenter varchar(200);

/* wnprc_billing-12.324-12.325.sql */

ALTER TABLE wnprc_billing.labworkFeeDefinition DROP COLUMN chargeType;
ALTER TABLE wnprc_billing.labworkFeeDefinition ADD chargeType varchar(100);

/* wnprc_billing-12.325-12.326.sql */

ALTER TABLE wnprc_billing.invoicedItems ADD transactionNumber int;

ALTER TABLE wnprc_billing.miscCharges ADD chargeType int;
ALTER TABLE wnprc_billing.miscCharges ADD billingDate timestamp;
ALTER TABLE wnprc_billing.miscCharges ADD invoiceId entityid;
ALTER TABLE wnprc_billing.miscCharges ADD description varchar(4000);
ALTER TABLE wnprc_billing.miscCharges DROP COLUMN descrption;

/* wnprc_billing-12.326-12.327.sql */

ALTER TABLE wnprc_billing.invoicedItems DROP COLUMN transactionNumber;
ALTER TABLE wnprc_billing.invoicedItems ADD transactionNumber varchar(100);

/* wnprc_billing-12.327-12.328.sql */

ALTER TABLE wnprc_billing.miscCharges ADD objectid entityid NOT NULL;

SELECT core.fn_dropifexists('miscCharges', 'wnprc_billing', 'CONSTRAINT', 'pk_miscCharges');

ALTER TABLE wnprc_billing.miscCharges ADD CONSTRAINT pk_miscCharges PRIMARY KEY (objectid);

/* wnprc_billing-12.328-12.329.sql */

ALTER TABLE wnprc_billing.miscCharges DROP COLUMN rowid;

/* wnprc_billing-12.329-12.330.sql */

ALTER TABLE wnprc_billing.invoiceRuns DROP COLUMN runBy;
ALTER TABLE wnprc_billing.invoiceRuns DROP COLUMN date;

ALTER TABLE wnprc_billing.invoiceRuns ADD invoiceNumber varchar(200);

ALTER TABLE wnprc_billing.miscCharges ADD invoicedItemId entityid;
ALTER TABLE wnprc_billing.miscCharges DROP COLUMN description;

/* wnprc_billing-12.330-12.331.sql */

ALTER TABLE wnprc_billing.invoicedItems ADD investigatorId int;

/* wnprc_billing-12.331-12.332.sql */

ALTER TABLE wnprc_billing.miscCharges ADD item varchar(500);

/* wnprc_billing-12.332-12.333.sql */

CREATE TABLE wnprc_billing.dataAccess (
  rowId serial NOT NULL,
  userid int,
  investigatorId int,
  project int,
  allData bool,

  container entityid NOT NULL,
  createdBy int,
  created timestamp,
  modifiedBy int,
  modified timestamp,

  CONSTRAINT PK_dataAccess PRIMARY KEY (rowId)
);

/* wnprc_billing-12.334-12.335.sql */

ALTER TABLE wnprc_billing.grantProjects ADD protocolNumber Varchar(100);
ALTER TABLE wnprc_billing.grantProjects ADD projectStatus Varchar(100);
ALTER TABLE wnprc_billing.grantProjects ADD aliasEnabled Varchar(100);
ALTER TABLE wnprc_billing.grantProjects ADD ogaProjectId int;

ALTER TABLE wnprc_billing.grantProjects DROP COLUMN spid;
ALTER TABLE wnprc_billing.grantProjects DROP COLUMN currentDCBudget;
ALTER TABLE wnprc_billing.grantProjects DROP COLUMN currentFABudget;
ALTER TABLE wnprc_billing.grantProjects DROP COLUMN totalDCBudget;
ALTER TABLE wnprc_billing.grantProjects DROP COLUMN totalFABudget;
ALTER TABLE wnprc_billing.grantProjects DROP COLUMN awardStartDate;
ALTER TABLE wnprc_billing.grantProjects DROP COLUMN awardEndDate;
ALTER TABLE wnprc_billing.grantProjects DROP COLUMN currentYear;
ALTER TABLE wnprc_billing.grantProjects DROP COLUMN totalYears;
ALTER TABLE wnprc_billing.grantProjects DROP COLUMN awardSuffix;

ALTER TABLE wnprc_billing.grants ADD awardStatus Varchar(100);
ALTER TABLE wnprc_billing.grants ADD applicationType Varchar(100);
ALTER TABLE wnprc_billing.grants ADD activityType Varchar(100);

ALTER TABLE wnprc_billing.grants ADD ogaAwardId int;

ALTER TABLE wnprc_billing.fiscalAuthorities ADD employeeId varchar(100);

/* wnprc_billing-12.335-12.336.sql */

ALTER TABLE wnprc_billing.grants ADD rowid serial;
ALTER TABLE wnprc_billing.grants ADD container entityid;

ALTER TABLE wnprc_billing.grants DROP CONSTRAINT PK_grants;
ALTER TABLE wnprc_billing.grants ADD CONSTRAINT PK_grants PRIMARY KEY (rowid);
ALTER TABLE wnprc_billing.grants ADD CONSTRAINT UNIQUE_grants UNIQUE (container, grantNumber);

ALTER TABLE wnprc_billing.grants DROP COLUMN totalDCBudget;
ALTER TABLE wnprc_billing.grants DROP COLUMN totalFABudget;

/* wnprc_billing-12.336-12.337.sql */

ALTER TABLE wnprc_billing.grants ADD investigatorName varchar(200);
ALTER TABLE wnprc_billing.grantProjects ADD investigatorName varchar(200);

/* wnprc_billing-12.337-12.338.sql */

ALTER TABLE wnprc_billing.invoiceRuns ADD status varchar(200);

/* wnprc_billing-12.338-12.339.sql */

ALTER TABLE wnprc_billing.miscCharges DROP COLUMN chargeType;
ALTER TABLE wnprc_billing.miscCharges ADD chargeType varchar(200);
ALTER TABLE wnprc_billing.miscCharges ADD sourceInvoicedItem entityid;

/* wnprc_billing-12.339-12.340.sql */

ALTER TABLE wnprc_billing.miscCharges ADD creditaccount varchar(100);

/* wnprc_billing-12.340-12.341.sql */

ALTER TABLE wnprc_billing.grantProjects DROP COLUMN alias;
ALTER TABLE wnprc_billing.grantProjects DROP COLUMN aliasEnabled;

CREATE TABLE wnprc_billing.aliases (
  rowid serial,
  alias varchar(200),
  aliasEnabled Varchar(100),

  projectNumber varchar(200),
  grantNumber varchar(200),
  agencyAwardNumber varchar(200),
  investigatorId int,
  investigatorName varchar(200),
  fiscalAuthority int,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_aliases PRIMARY KEY (rowid)
);

/* wnprc_billing-12.341-12.342.sql */

ALTER TABLE wnprc_billing.miscCharges ADD debitedaccount varchar(200);
ALTER TABLE wnprc_billing.miscCharges rename creditaccount to creditedaccount;

/* wnprc_billing-12.342-12.343.sql */

ALTER TABLE wnprc_billing.miscCharges ADD qcstate int;

/* wnprc_billing-12.343-12.344.sql */

ALTER TABLE wnprc_billing.perDiemFeeDefinition ADD tier varchar(100);

/* wnprc_billing-12.344-12.345.sql */

ALTER TABLE wnprc_billing.aliases ADD fiscalAuthorityName varchar(200);

/* wnprc_billing-12.345-12.346.sql */

ALTER TABLE wnprc_billing.chargeableItems ADD allowsCustomUnitCost boolean DEFAULT false;

UPDATE wnprc_billing.chargeableItems SET allowsCustomUnitCost = false;

/* wnprc_billing-12.346-12.347.sql */

ALTER TABLE wnprc_billing.aliases ADD category varchar(100);

/* wnprc_billing-12.347-12.348.sql */

ALTER TABLE wnprc_billing.miscCharges ADD parentid entityid;

ALTER TABLE wnprc_billing.perDiemFeeDefinition DROP COLUMN releaseCondition;
ALTER TABLE wnprc_billing.perDiemFeeDefinition DROP COLUMN startDate;

/* wnprc_billing-12.349-12.350.sql */

ALTER TABLE wnprc_billing.invoicedItems ADD chargetype varchar(100);

/* wnprc_billing-12.350-12.351.sql */

ALTER TABLE wnprc_billing.invoicedItems ADD sourcerecord2 varchar(100);
ALTER TABLE wnprc_billing.invoicedItems ADD issueId int;
ALTER TABLE wnprc_billing.miscCharges ADD issueId int;

/* wnprc_billing-12.351-12.352.sql */

ALTER TABLE wnprc_billing.chargeRateExemptions ADD remark varchar(4000);
ALTER TABLE wnprc_billing.chargeRateExemptions ADD subsidy double precision;

CREATE TABLE wnprc_billing.projectFARates (
  rowid serial,
  project int,
  fa double precision,
  remark varchar(4000),
  startdate timestamp,
  enddate timestamp,

  container entityid,
  createdby int,
  created timestamp,
  modifiedby int,
  modified timestamp
);

/* wnprc_billing-12.352-12.353.sql */

ALTER TABLE wnprc_billing.chargeRateExemptions DROP COLUMN subsidy;
ALTER TABLE wnprc_billing.chargeRates ADD subsidy double precision;

/* wnprc_billing-12.353-12.354.sql */

DROP TABLE wnprc_billing.projectFARates;
ALTER TABLE wnprc_billing.aliases ADD faRate double precision;
ALTER TABLE wnprc_billing.aliases ADD faSchedule varchar(200);

/* wnprc_billing-12.354-12.355.sql */

ALTER TABLE wnprc_billing.aliases ADD budgetStartDate timestamp;
ALTER TABLE wnprc_billing.aliases ADD budgetEndDate timestamp;

CREATE INDEX IDX_aliases ON wnprc_billing.aliases (container, alias);

/* wnprc_billing-12.355-12.356.sql */

ALTER TABLE wnprc_billing.invoicedItems DROP CONSTRAINT PK_billedItems;

ALTER TABLE wnprc_billing.invoicedItems ALTER COLUMN objectid SET NOT NULL;

ALTER TABLE wnprc_billing.invoicedItems ADD CONSTRAINT PK_invoicedItems PRIMARY KEY (objectid);

CREATE TABLE wnprc_billing.chargeableItemCategories (
  category varchar(100),

  CONSTRAINT PK_chargeableItemCategories PRIMARY KEY (category)
);

INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Animal Per Diem');
INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Clinical Lab Test');
INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Clinical Procedure');
INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Lease Fees');
INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Lease Setup Fees');
INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Misc. Fees');
INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Small Animal Per Diem');
INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Surgery');
INSERT INTO wnprc_billing.chargeableItemCategories (category) VALUES ('Time Mated Breeders');

CREATE TABLE wnprc_billing.aliasCategories (
  category varchar(100),

  CONSTRAINT PK_aliasCategories PRIMARY KEY (category)
);

INSERT INTO wnprc_billing.aliasCategories (category) VALUES ('OGA');
INSERT INTO wnprc_billing.aliasCategories (category) VALUES ('Other');
INSERT INTO wnprc_billing.aliasCategories (category) VALUES ('GL');

/* wnprc_billing-12.356-12.357.sql */

ALTER TABLE wnprc_billing.creditAccount ADD COLUMN tempaccount varchar(100);
UPDATE wnprc_billing.creditAccount SET tempaccount = cast(account as varchar(100));
ALTER TABLE wnprc_billing.creditAccount DROP COLUMN account;
ALTER TABLE wnprc_billing.creditAccount ADD COLUMN account varchar(100);
UPDATE wnprc_billing.creditAccount SET account = tempaccount;
ALTER TABLE wnprc_billing.creditAccount DROP COLUMN tempaccount;

/* wnprc_billing-12.357-12.358.sql */

ALTER TABLE wnprc_billing.aliases ADD COLUMN projectTitle varchar(1000);
ALTER TABLE wnprc_billing.aliases ADD COLUMN projectDescription varchar(1000);
ALTER TABLE wnprc_billing.aliases ADD COLUMN projectStatus varchar(200);

/* wnprc_billing-12.358-12.359.sql */

CREATE TABLE wnprc_billing.bloodDrawFeeDefinition (
    rowid serial,
    chargeType int,
    chargeId int,

    active bool default true,
    objectid ENTITYID,
    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT PK_bloodDrawFeeDefinition PRIMARY KEY (rowId)
);

/* wnprc_billing-12.359-12.360.sql */

ALTER TABLE wnprc_billing.bloodDrawFeeDefinition DROP COLUMN chargetype;
ALTER TABLE wnprc_billing.bloodDrawFeeDefinition ADD chargetype varchar(100);
ALTER TABLE wnprc_billing.bloodDrawFeeDefinition ADD creditalias varchar(100);

/* wnprc_billing-12.360-12.361.sql */

ALTER TABLE wnprc_billing.miscCharges DROP COLUMN account;
ALTER TABLE wnprc_billing.miscCharges DROP COLUMN totalcost;

/* wnprc_billing-12.361-12.362.sql */

ALTER TABLE wnprc_billing.aliases ADD aliasType VARCHAR(100);

DELETE FROM wnprc_billing.aliasCategories WHERE category = 'Non-Syncing';
INSERT INTO wnprc_billing.aliasCategories (category) VALUES ('Non-Syncing');

/* wnprc_billing-12.362-12.363.sql */

CREATE TABLE wnprc_billing.aliasTypes (
    aliasType varchar(500),
    removeSubsidy bool,
    canRaiseFA bool,

    createdBy integer,
    created timestamp,
    modifiedBy integer,
    modified timestamp,

    CONSTRAINT PK_aliasTypes PRIMARY KEY (aliasType)
);

/* wnprc_billing-12.363-12.364.sql */

CREATE TABLE wnprc_billing.projectMultipliers (
    rowid serial,
    project integer,
    multiplier double precision,

    startdate timestamp,
    enddate timestamp,
    comment varchar(4000),

    container entityid,
    createdBy integer,
    created timestamp,
    modifiedBy integer,
    modified timestamp,

    CONSTRAINT PK_projectMultipliers PRIMARY KEY (rowid)
);

ALTER TABLE wnprc_billing.chargeableItems ADD canRaiseFA bool;

/* wnprc_billing-12.364-12.365.sql */

ALTER TABLE wnprc_billing.miscCharges ADD formSort integer;

CREATE TABLE wnprc_billing.miscChargesType (
  category varchar(100) not null,

  CONSTRAINT PK_miscChargesType PRIMARY KEY (category)
);

INSERT INTO wnprc_billing.miscChargesType (category) VALUES ('Adjustment');
INSERT INTO wnprc_billing.miscChargesType (category) VALUES ('Reversal');

ALTER TABLE wnprc_billing.miscCharges ADD chargeCategory VARCHAR(100);

UPDATE wnprc_billing.miscCharges SET chargeCategory = chargetype;
UPDATE wnprc_billing.miscCharges SET chargetype = null;

ALTER TABLE wnprc_billing.invoicedItems RENAME COLUMN chargetype TO chargeCategory;

/* wnprc_billing-12.365-12.366.sql */

DROP TABLE wnprc_billing.bloodDrawFeeDefinition;
DROP TABLE wnprc_billing.clinicalFeeDefinition;

ALTER TABLE wnprc_billing.perDiemFeeDefinition ADD canChargeInfants bool default false;
ALTER TABLE wnprc_billing.procedureFeeDefinition ADD assistingStaff VARCHAR(100);

CREATE TABLE wnprc_billing.medicationFeeDefinition (
    rowid serial,
    route varchar(100),
    chargeId int,

    active bool default true,
    objectid ENTITYID,
    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT PK_medicationFeeDefinition PRIMARY KEY (rowId)
);

CREATE TABLE wnprc_billing.chargeUnits (
    chargetype varchar(100) NOT NULL,
    shownInBlood bool default false,
    shownInLabwork bool default false,
    shownInMedications bool default false,
    shownInProcedures bool default false,

    active bool default true,
    container entityid,
    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT PK_chargeUnits PRIMARY KEY (chargetype)
);

CREATE TABLE wnprc_billing.chargeUnitAccounts (
    rowid serial,
    chargetype varchar(100),
    account varchar(100),
    startdate timestamp,
    enddate timestamp,

    container entityid,
    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp,

    CONSTRAINT PK_chargeUnitAccounts PRIMARY KEY (rowid)
);

/* wnprc_billing-12.366-12.367.sql */

ALTER TABLE wnprc_billing.chargeableItems ADD allowBlankId bool;
UPDATE wnprc_billing.chargeableItems SET allowBlankId = false;

/* wnprc_billing-12.367-12.368.sql */

ALTER TABLE wnprc_billing.projectMultipliers ADD account varchar(100);

UPDATE wnprc_billing.projectMultipliers SET account = (
  SELECT max(account) FROM wnprc_billing.projectAccountHistory a
  WHERE a.project = projectMultipliers.project
   AND a.startdate <= now()
   AND a.enddate >= now()
);

ALTER TABLE wnprc_billing.projectMultipliers DROP COLUMN project;

/* wnprc_billing-12.368-12.369.sql */

ALTER TABLE wnprc_billing.chargeUnits ADD servicecenter varchar(100);

ALTER TABLE wnprc_billing.leaseFeeDefinition ADD chargeunit varchar(100);

/* wnprc_billing-12.369-12.370.sql */

CREATE INDEX IDX_projectAccountHistory_project_enddate ON wnprc_billing.projectAccountHistory (project, enddate);

/* wnprc_billing-12.370-12.371.sql */

ALTER TABLE wnprc_billing.medicationFeeDefinition ADD code VARCHAR(100);

/* Incorporating changes (made to onprc_billing) from 2016  */
ALTER TABLE wnprc_billing.procedureFeeDefinition ADD startDate timestamp;
ALTER TABLE wnprc_billing.procedureFeeDefinition ADD endDate timestamp;

ALTER TABLE wnprc_billing.labWorkFeeDefinition ADD startDate timestamp;
ALTER TABLE wnprc_billing.labWorkFeeDefinition ADD endDate timestamp;

ALTER TABLE wnprc_billing.leaseFeeDefinition ADD startDate timestamp;
ALTER TABLE wnprc_billing.leaseFeeDefinition ADD endDate timestamp;
ALTER TABLE wnprc_billing.chargeableItems ADD startDate timestamp;
ALTER TABLE wnprc_billing.chargeableItems ADD endDate timestamp;


ALTER TABLE wnprc_billing.perDiemFeeDefinition ADD startDate timestamp;
ALTER TABLE wnprc_billing.perDiemFeeDefinition ADD endDate timestamp;

ALTER TABLE wnprc_billing.medicationFeeDefinition ADD startDate timestamp;
ALTER TABLE wnprc_billing.medicationFeeDefinition ADD endDate timestamp;

CREATE TABLE wnprc_billing.AnnualRateChange (
    billingYear varchar(10) not null,
    inflationRate double precision,
    startDate timestamp,
    endDate timestamp,

    createdBy int,
    created timestamp,
    modifiedBy int,
    modified timestamp
);

/* wnprc_billing-17.21-17.22.sql */

CREATE TABLE wnprc_billing.tierRates(

    rowId SERIAL NOT NULL,
    tierRate_2 double precision,
    tierRate_2A double precision,
    tierRate_3 double precision,
    startDate timestamp,
    endDate timestamp,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_WNPRC_BILLING_TIERRATES PRIMARY KEY (rowId),
    CONSTRAINT FK_WNPRC_BILLING_TIERRATES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)

);
CREATE INDEX WNPRC_BILLING_TIERRATES_CONTAINER_INDEX ON wnprc_billing.tierRates (Container);

CREATE TABLE wnprc_billing.groups(

    rowId SERIAL NOT NULL,
    name varchar(50),
    active boolean default true,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created timestamp,
    modifiedBy USERID,
    modified timestamp,

    CONSTRAINT PK_WNPRC_BILLING_GROUPS PRIMARY KEY (rowId),
    CONSTRAINT FK_WNPRC_BILLING_GROUPS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)

);
CREATE INDEX WNPRC_BILLING_GROUPS_CONTAINER_INDEX ON wnprc_billing.groups (Container);

CREATE TABLE wnprc_billing.affiliates (

  rowId SERIAL NOT NULL,
  affiliate varchar(100)

);

INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('WNPRC_core');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('ICTR');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('National_CTSA');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('National_Primate_Center');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('UW_campus');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('Other_Universities_organizations');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('Commercial');
INSERT INTO wnprc_billing.affiliates (affiliate) VALUES ('Exception_N/C');

TRUNCATE TABLE wnprc_billing.aliasCategories;

/* wnprc_billing-17.22-17.23.sql */

DROP TABLE wnprc_billing.chargeRates;
DROP TABLE wnprc_billing.aliases;