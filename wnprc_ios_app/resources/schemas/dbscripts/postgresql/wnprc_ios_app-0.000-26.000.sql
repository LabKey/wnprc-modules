-- This tracks the official SQL script that will be used when migrating to production for the first time.

--Creates the schema to hold tables for the wnprc ios app.
CREATE SCHEMA IF NOT EXISTS wnprc_ios_app;





-- Creates 'Reported Issues' dataset.
DROP TABLE IF EXISTS wnprc_ios_app.reported_issues;
CREATE TABLE wnprc_ios_app.reported_issues (
    -- Default LabKey fields.
    rowid      serial NOT NULL,
    container  entityid NOT NULL,
    createdby  userid NOT NULL,
    created    TIMESTAMP NOT NULL,
    modifiedby userid NOT NULL,
    modified   TIMESTAMP NOT NULL,

    -- Issue details.
    issue_description varchar(4000) NOT NULL,

    -- Dev details.
    dev_comments varchar(4000),
    status varchar(100) NOT NULL,

    -- Primary key.
    CONSTRAINT PK_reported_issues PRIMARY KEY (rowid)
);





-- Creates 'Animal Abstract Preferences' dataset.
DROP TABLE IF EXISTS wnprc_ios_app.user_animal_abstract_preferences;
CREATE TABLE wnprc_ios_app.user_animal_abstract_preferences (
-- Default LabKey fields.
container  entityid NOT NULL,
createdby  userid NOT NULL,
created    TIMESTAMP NOT NULL,
modifiedby userid NOT NULL,
modified   TIMESTAMP NOT NULL,

-- Preferences.
show_id BOOLEAN NOT NULL DEFAULT TRUE,
show_gender BOOLEAN NOT NULL DEFAULT TRUE,
show_availability BOOLEAN NOT NULL DEFAULT TRUE,
show_room BOOLEAN NOT NULL DEFAULT TRUE,
show_cage BOOLEAN NOT NULL DEFAULT TRUE,
show_condition BOOLEAN NOT NULL DEFAULT TRUE,
show_num_animals_in_cage BOOLEAN NOT NULL DEFAULT TRUE,
show_status BOOLEAN NOT NULL DEFAULT TRUE,
show_age BOOLEAN NOT NULL DEFAULT TRUE,
show_birth BOOLEAN NOT NULL DEFAULT TRUE,
show_dam BOOLEAN NOT NULL DEFAULT TRUE,
show_sire BOOLEAN NOT NULL DEFAULT TRUE,
show_tb_date BOOLEAN NOT NULL DEFAULT TRUE,
show_prepaid BOOLEAN NOT NULL DEFAULT TRUE,
show_mgap_ids BOOLEAN NOT NULL DEFAULT TRUE,
show_most_recent_weight BOOLEAN NOT NULL DEFAULT TRUE,
show_most_recent_weight_date BOOLEAN NOT NULL DEFAULT TRUE,
show_hold BOOLEAN NOT NULL DEFAULT TRUE,
show_medical BOOLEAN NOT NULL DEFAULT TRUE,
show_current_behaviors BOOLEAN NOT NULL DEFAULT TRUE,
show_most_recent_alopecia_score BOOLEAN NOT NULL DEFAULT TRUE,
show_most_recent_body_condition_score BOOLEAN NOT NULL DEFAULT TRUE,
show_origin BOOLEAN NOT NULL DEFAULT TRUE,
show_geographic_origin BOOLEAN NOT NULL DEFAULT TRUE,
show_ancestry BOOLEAN NOT NULL DEFAULT TRUE,
show_most_recent_arrival BOOLEAN NOT NULL DEFAULT TRUE,
show_most_recent_departure BOOLEAN NOT NULL DEFAULT TRUE,
show_death BOOLEAN NOT NULL DEFAULT TRUE,
show_remark BOOLEAN NOT NULL DEFAULT TRUE,
show_mgap_sequence_types BOOLEAN NOT NULL DEFAULT TRUE,

-- Primary key.
target_user userid NOT NULL,
CONSTRAINT PK_user_animal_abstract_preferences PRIMARY KEY (target_user)
);





-- Creates 'Session Log' dataset.
DROP TABLE IF EXISTS wnprc_ios_app.session_log;
CREATE TABLE wnprc_ios_app.session_log (
-- Default LabKey fields.
container  entityid NOT NULL,
createdby  userid NOT NULL,
created    TIMESTAMP NOT NULL,
modifiedby userid NOT NULL,
modified   TIMESTAMP NOT NULL,

-- Request details.
original_row_id varchar(100) NOT NULL,
query_name varchar(4000) NOT NULL,
request_type varchar(100) NOT NULL,
errors_occurred BOOLEAN NOT NULL DEFAULT FALSE,
dev_comments varchar(4000),
error_description varchar(4000),

-- Primary key.
CONSTRAINT PK_wnprc_ios_app PRIMARY KEY (original_row_id)
);





-- Creates 'Push Notifications' dataset.
DROP TABLE IF EXISTS wnprc_ios_app.push_notifications;
CREATE TABLE wnprc_ios_app.push_notifications (
-- Default LabKey fields.
container  entityid NOT NULL,
createdby  userid NOT NULL,
created    TIMESTAMP NOT NULL,
modifiedby userid NOT NULL,
modified   TIMESTAMP NOT NULL,

-- Push details.
push_token varchar(4000),

-- Primary key.
target_user userid NOT NULL,
CONSTRAINT PK_push_notifications PRIMARY KEY (target_user)
);
