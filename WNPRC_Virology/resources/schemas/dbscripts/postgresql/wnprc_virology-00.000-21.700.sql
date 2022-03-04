CREATE SCHEMA wnprc_virology;

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
    account             text NOT NULL,
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

    CONSTRAINT pk_rsehr_folders_accounts_and_vl_reader_emails_rowid PRIMARY KEY (rowid)
);

