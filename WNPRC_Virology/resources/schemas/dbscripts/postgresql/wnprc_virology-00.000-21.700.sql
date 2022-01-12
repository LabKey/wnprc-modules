CREATE SCHEMA wnprc_virology;

DROP TABLE IF EXISTS wnprc_virology.folder_paths_with_readers;
CREATE TABLE wnprc_virology.folder_paths_with_readers
(
    rowid               serial NOT NULL,
    folder_container_id text NOT NULL,
    folder_path         text NOT NULL,
    emails              text NOT NULL,

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_folder_paths_with_readers_rowid PRIMARY KEY (rowid)
);

DROP TABLE IF EXISTS wnprc_virology.folder_to_experiment_mappings;
CREATE TABLE wnprc_virology.folder_to_experiment_mappings
(
    rowid               serial NOT NULL,
    animal_id           text NOT NULL,
    client_name         text NOT NULL,
    folder_container_id text NOT NULL,
    folder_path         text NOT NULL,

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_folder_to_experiment_mappings_rowid PRIMARY KEY (rowid)
);

