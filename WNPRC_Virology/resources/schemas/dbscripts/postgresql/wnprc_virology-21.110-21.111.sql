DROP TABLE IF EXISTS wnprc_virology.grant_accounts CASCADE;
CREATE TABLE wnprc_virology.grant_accounts
(
    rowid               int NOT NULL,
    --rowid_etl           int, -- store the actual rowid so that when WNPRC_ViralLoadsRSEHREmails ETL gets sent back to EHR we refer to the same accnt num
    alias               varchar(200),
    aliasEnabled        Varchar(100),
    projectNumber       varchar(200),
    grantNumber         varchar(200),
    agencyAwardNumber   varchar(200),
    investigatorId      int,
    investigatorName    varchar(200),
    fiscalAuthority     int,
    fiscalAuthorityName varchar(200),
    category            varchar(100),
    faRate              double precision,
    faSchedule          varchar(200),
    budgetStartDate     timestamp,
    budgetEndDate       timestamp,
    projectTitle        varchar(1000),
    projectDescription  varchar(1000),
    projectStatus       varchar(200),
    aliasType           varchar(100),
    lsid                varchar(100),
    groupName           varchar(100),
    isActive            boolean,
    isAcceptingCharges  boolean,

    container           entityid NOT NULL,
    createdBy           userid,
    created             timestamp,
    modifiedBy          userid,
    modified            timestamp,
    --UNIQUE(rowid_etl),

    CONSTRAINT PK_grant_accounts PRIMARY KEY (rowid)
);

DROP TABLE IF EXISTS wnprc_virology.folder_paths_with_readers;
CREATE TABLE wnprc_virology.folder_paths_with_readers
(
    rowid               serial NOT NULL,
    folder_container_id text NOT NULL,
    folder_path         text NOT NULL,
    folder_name         text NOT NULL,
    emails              text,

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_folder_paths_with_readers_rowid PRIMARY KEY (rowid)
);

DROP TABLE IF EXISTS wnprc_virology.rsehr_folders_accounts_and_vl_reader_emails;
CREATE TABLE wnprc_virology.rsehr_folders_accounts_and_vl_reader_emails
(
    rowid               serial NOT NULL,
    account             integer NOT NULL,
    emails              text,
    folder_name         text NOT NULL,
    folder_container_id text NOT NULL,
    folder_path         text NOT NULL,

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_rsehr_folders_accounts_and_vl_reader_emails_rowid PRIMARY KEY (rowid),
    CONSTRAINT FK_rsehr_folders_accounts_and_vl_reader_emails_account FOREIGN KEY (account) REFERENCES ehr_billing.aliases (rowid)
);

DROP TABLE IF EXISTS wnprc_virology.folders_accounts_mappings;
CREATE TABLE wnprc_virology.folders_accounts_mappings
(
    rowid               serial NOT NULL,
    folder_name         text NOT NULL,
    account             integer NOT NULL,
    UNIQUE(folder_name, account),

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_folders_accounts_mappings_rowid PRIMARY KEY (rowid),
    CONSTRAINT FK_rsehr_folders_accounts_mappings_account FOREIGN KEY (account) REFERENCES wnprc_virology.grant_accounts (rowid)
);

